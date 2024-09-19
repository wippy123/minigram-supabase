import { StreamChat } from 'stream-chat'
import { NextResponse } from 'next/server'

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!,
  process.env.GETSTREAM_API_SECRET!
)

export async function POST(request: Request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const token = serverClient.createToken(userId)
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating Stream Chat token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}