import { Duration } from '@/lib/duration'
import { getModelClient, getDefaultMode } from '@/lib/models'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import ratelimit from '@/lib/ratelimit'
import { fragmentSchema as schema } from '@/lib/schema'
import { Templates } from '@/lib/templates'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { streamObject, LanguageModel, CoreMessage } from 'ai'
import { cookies } from 'next/headers';

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
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();


  const limit = !config.apiKey
    ? await ratelimit(
        userID,
        rateLimitMaxRequests,
        ratelimitWindow,
      )
    : false

       const { data, error } = await supabase?.from('brand_settings').select('header, footer, font, palette')
        .eq('user_id', user?.id)
        .single()


  if (data?.header) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to add the following code as the header to any fragment you generate: ${data?.header}` }],
    });
  }
  if (data?.footer) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to add the following code as the footer to any fragment you generate: ${data?.footer}` }],
    });
  }
  if (data?.font) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to following font for any fragment you generate: ${data?.font}. Ensure you use the correct font weights and sizes and add an @font-face declaration to the head of the document` }],
    });
  }
  if (data?.palette) {
    messages.push({
      role: "user",
      content: [{ type: "text", text: `be sure to use the following shadcn palette for any fragment you generate: ${data?.palette} add any additional css you need to make sure the colors are correct` }],
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

  console.log('userID', userID)
  // console.log('template', template)
  console.log('model', model)
  // console.log('config', config)

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  const stream = await streamObject({
    model: modelClient as LanguageModel,
    schema,
    system: toPrompt(template),
    messages,
    mode: getDefaultMode(model),
    ...modelParams,
  })

  return stream.toTextStreamResponse()
}
