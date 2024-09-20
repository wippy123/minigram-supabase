"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useParams, useSearchParams } from "next/navigation";
import { getAvatarUrl } from "@/utils/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { toast } from "react-hot-toast";
import "stream-chat-react/dist/css/v2/index.css";
import { EmojiPicker } from "stream-chat-react/emojis";

import { SearchIndex } from "emoji-mart";
import { Task } from "@/components/tasks/TaskList";
// import data from "@emoji-mart/data";

export default function ChatPage() {
  const supabase = createClientComponentClient();
  const [loaded, setLoaded] = useState(false);
  const client = StreamChat.getInstance("49wdm2zxn2xb");
  const [channel, setChannel] = useState<any>();
  const [chatInfo, setChatInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const taskDataParam = searchParams.get("taskData");
  const task: Task | null = taskDataParam
    ? JSON.parse(decodeURIComponent(taskDataParam))
    : null;
  // Use the useParams hook to get the task ID from the URL
  const params = useParams();
  const taskId = params.id as string;

  function formatDateTime(date?: string, time?: string) {
    if (!date) return "No due date";
    const dateObj = new Date(`${date}T${time || "00:00:00"}`);
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  const getStreamToken = async (userId: string) => {
    try {
      const response = await fetch("/api/stream-chat-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Stream Chat token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching Stream Chat token:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!taskId) return;

      try {
        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .eq("task_id", taskId)
          .single();

        if (data) {
          setChatInfo(data);
          const user = await supabase.auth.getUser();
          const token = await getStreamToken(user.data.user?.id as string);
          await client.connectUser(
            {
              id: user.data.user?.id ?? "",
              name: "Todd Storm",
              image: getAvatarUrl(user.data.user?.id as string),
            },
            token
          );
          console.log("participants", data.participants);
          const channel = client.channel("messaging", data.channel_id, {
            members: data.participants,
            name: `Task ${taskId}`,
          });
          setLoaded(true);
          setChannel(channel);
        } else {
          toast("No chat found");
        }
      } catch (error) {
        toast("An unexpected error occurred.");
        console.log("error", error);
      }
    };

    fetchChatInfo();
  }, [taskId, supabase, toast]);

  if (!loaded)
    return (
      <div className="text-center p-4 text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        {task && (
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                {task.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {task.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {task.status}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Due: {formatDateTime(task.due_date, task.due_time)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <Chat
          client={client}
          theme="str-chat__theme-light dark:str-chat__theme-dark"
        >
          <Channel
            channel={channel}
            EmojiPicker={EmojiPicker}
            emojiSearchIndex={SearchIndex}
          >
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
}
