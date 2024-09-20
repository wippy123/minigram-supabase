import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FileUploadData, TaskData } from "@/lib/supabaseClient";
import { StreamChat } from "stream-chat";
const streamApiKey = process.env.NEXT_PUBLIC_GETSTREAM_API_KEY as string;
const streamApiSecret = process.env.GETSTREAM_API_SECRET as string;
const STORAGE_BUCKET_NAME = "task-files";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}

 async function insertFileUpload(fileData: FileUploadData) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('file_uploads')
    .insert(fileData)
    .select();

  // if (error) throw error;
  return {error, data}
}

async function insertChat(chatData: {
  task_id: string;
  channel_id: string;
  participants: string[];
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chats')
    .insert(chatData)
    .select();

  if (error) {
    console.error("Error inserting chat:", error);
    throw error;
  }

  return data;
}

const createChatChannel = async (newTaskData: TaskData, insertedTaskId: string) => {
  
  // NOW CREATE CHAT CHANNEL
  const client = StreamChat.getInstance(streamApiKey, streamApiSecret);
  if (!client.secret){
    client.secret=streamApiSecret
}

  // Ensure owner exists
  await ensureUserExists(client, newTaskData.owner_id);

  // Ensure assignee exists if assigned
  if (newTaskData.assigned_user_id) {
    await ensureUserExists(client, newTaskData.assigned_user_id);
  }

  const channelId = `Chat-${insertedTaskId}`;

  // Create the channel
  const channel = client.channel("messaging", channelId, {
    members: [
      newTaskData.owner_id,
      ...(newTaskData.assigned_user_id ? [newTaskData.assigned_user_id] : []),
    ],
    name: newTaskData.title,
    created_by_id: newTaskData.owner_id, // Add this line
  });

  // Create the channel
  await channel.create();

  // Insert chat record
  const chatData = {
    task_id: insertedTaskId,
    channel_id: channelId,
    participants: [newTaskData.owner_id, newTaskData.assigned_user_id],
  };
  try {
    await insertChat({
      ...chatData,
      participants: chatData.participants.filter((participant): participant is string => participant !== null)
    });
  } catch (error) {
    console.error("Error inserting chat record:", error);
    throw new Error("Failed to create chat record");
  }
};

  // Create or update users in GetStream
  async function ensureUserExists(client: StreamChat, userId: string) {
    try {
      await client.upsertUser({ id: userId });
    } catch (error) {
      console.error(`Error creating/updating user ${userId}:`, error);
      throw error;
    }
  }



export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const newTaskDataString = formData.get('newTaskData') as string;
  const newTaskData = JSON.parse(newTaskDataString);

  const files: File[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith('file') && value instanceof File) {
      files.push(value);
    }
  });


  const supabase = createClient();
  const { data: insertedTask, error: taskError } = await supabase
  .from("tasks")
  .insert(newTaskData)
  .select()
  .single();

 // Upload files
 for (const file of files) {
    const filePath = `${newTaskData.team_id}/${insertedTask.id}/${file.name}`;
    // Insert file record
    const fileUploadData: FileUploadData = {
      task_id: insertedTask.id,
      user_id: newTaskData.owner_id,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
    };

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const fileUploadResponse = await insertFileUpload(fileUploadData)
    console.log("fileUploadResponse", fileUploadResponse);
  
}
 
// cant create chat channel if no assigned user.  need two participants
if (newTaskData.assigned_user_id && newTaskData.owner_id !== newTaskData.assigned_user_id) {
  await createChatChannel(newTaskData, insertedTask.id);
}

  return NextResponse.json({ task: insertedTask, channel: newTaskData.title }, { status: 201 })
}

