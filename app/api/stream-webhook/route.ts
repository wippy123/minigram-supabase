import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body
    const body = await req.json();
console.log('body from webhook', body);
    // Extract relevant data from the webhook payload
    const { type, user } = body;

    // // Validate required data
    // if (!type || !user || !user.id) {
    //   return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    // }

    // // Process the webhook data
    // console.log(`Received Stream webhook: Event Type: ${type}, User ID: ${user.id}`);

    // TODO: Add your webhook processing logic here
    // For example, update user status, trigger notifications, etc.

    // Return a success response
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Stream webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}