import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body
    const body = await req.json();
console.log('body from webhook', body);
    // Extract relevant data from the webhook payload
    const { type, user, channel } = body;

    if (type === 'message.new') {
        const supabase = createServerComponentClient({ cookies });
        

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                message: `You have unread messages in chat ${channel.name}`,
                read: false
            });

        if (error) {
            console.error('Error inserting notification:', error);
        }
    }

    // Return a success response
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Stream webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}