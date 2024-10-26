import { Duration } from '@/lib/duration'
import { getModelClient, getDefaultMode } from '@/lib/models'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import ratelimit from '@/lib/ratelimit'
import { fragmentSchema as schema } from '@/lib/schema'
import { Templates } from '@/lib/templates'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { streamObject, LanguageModel, CoreMessage } from 'ai'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { decode } from 'base64-arraybuffer'

export const maxDuration = 60

const rateLimitMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 10
const ratelimitWindow = process.env.RATE_LIMIT_WINDOW
  ? (process.env.RATE_LIMIT_WINDOW as Duration)
  : '1d'

export async function POST(req: Request) {
  const {
    messages,
    userID,
    template,
    model,
    config,
  }: {
    messages: CoreMessage[]
    userID: string
    template: Templates
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  // New variable to filter image content
  const imageMessages = messages.map(message => ({
    ...message,
    content: Array.isArray(message.content)
      ? message.content.filter(content => content.type === 'image')
      : [],
  })).filter(message => message.content.length > 0)

  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const limit = !config.apiKey
    ? await ratelimit(
        userID,
        rateLimitMaxRequests,
        ratelimitWindow,
      )
    : false

  const { data } = await supabase.from('brand_settings')
    .select('header, footer, font, palette')
    .eq('user_id', user?.id)
    .single()

  const { header, footer, font, palette } = data || {}

  if (header) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to add the following code as the header to any fragment you generate: ${header}` }],
    });
  }
  if (footer) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to add the following code as the footer to any fragment you generate: ${footer}` }],
    });
  }
  if (font) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to following font for any fragment you generate: ${font}. Ensure you use the correct font weights and sizes and add an @font-face declaration to the head of the document` }],
    });
  }
  if (palette) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to use the following shadcn palette for any fragment you generate: ${palette} add any additional css you need to make sure the colors are correct` }],
    });
  }

  if (limit) {
    return new Response('You have reached your request limit for the day.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.amount.toString(),
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': limit.reset.toString(),
      },
    })
  }

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  // Function to determine file extension from base64 string
  function getFileExtension(base64String: string): string {
    const match = base64String.match(/^data:image\/(\w+);base64,/)
    return match ? match[1] : 'png' // Default to png if not found
  }

  // Function to save image and return URL
  async function saveImageToSupabase(imageContent: { type: string; image: string }) {
    const base64Data = imageContent.image.split(',')[1]
    const buffer = decode(base64Data)
    const fileExtension = getFileExtension(imageContent.image)
    const fileName = `${uuidv4()}.${fileExtension}`
    const contentType = `image/${fileExtension}`

    const { data, error } = await supabase.storage
      .from('minigram-gen-images')
      .upload(fileName, buffer, {
        contentType: contentType,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('minigram-gen-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  // Save images and get URLs
  const imageUrls = await Promise.all(
    imageMessages.flatMap(message =>
      message.content.map(async (content: any) => await saveImageToSupabase(content))
    )
  )

  // Filter out any null values (failed uploads)
  const validImageUrls = imageUrls.filter(url => url !== null)

  const stream = await streamObject({
    model: modelClient as LanguageModel,
    schema,
    system: toPrompt(template),
    messages: [
      ...messages,
      {
        role: 'user',
        content: `The following images have been uploaded and are available for use: ${validImageUrls.join(', ')}`,
      },
    ],
    mode: getDefaultMode(model),
    ...modelParams,
  })

  return stream.toTextStreamResponse()
}
