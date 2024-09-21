import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body
    const body = await req.json();
    // Extract relevant data from the webhook payload
    const { type, user } = body;

    if (type === 'user.unread_message_reminder') {
        const supabase = createServerComponentClient({ cookies });
        
        // Extract the channel ID from the webhook payload
        const channelId = Object.keys(body.channels)[0];
        console.log('Extracted channel ID:', channelId);

        // If you need just the numeric part, you can further process it
        const chatId = channelId.split('-')[1];
        console.log('Extracted chat ID:', chatId);

        const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('channel_id', channelId)
        .single();


        let taskName = ''
        if (chatData) {
            console.log('Chat data:', chatData);
            const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', chatData.task_id)
            .single();
            if (taskData) {
                taskName = taskData.title;
            }
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                message: `You have unread messages in chat ${chatId} for task ${taskName}`,
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