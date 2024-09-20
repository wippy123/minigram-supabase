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
import "@/styles/stream-chat-custom-theme.css";
import { EmojiPicker } from "stream-chat-react/emojis";
import { SearchIndex } from "emoji-mart";
import { Task } from "@/components/tasks/TaskList";
import { useTheme } from "@/contexts/ThemeContext";

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
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select("*")
          .eq("task_id", taskId)
          .single();

        if (chatError) throw chatError;

        if (chatData) {
          // Fetch display names for participants
          const { data: participantsData, error: participantsError } =
            await supabase
              .from("profile_settings")
              .select("id, display_name")
              .in("id", chatData.participants);

          if (participantsError) throw participantsError;

          const participantsMap = new Map(
            participantsData.map((p) => [p.id, p.display_name])
          );

          setChatInfo({
            ...chatData,
            participants: chatData.participants.map((userId: string) => ({
              id: userId,
              displayName: participantsMap.get(userId) || userId,
            })),
          });

          const user = await supabase.auth.getUser();
          const token = await getStreamToken(user.data.user?.id as string);
          await client.connectUser(
            {
              id: user.data.user?.id ?? "",
              name:
                participantsMap.get(user.data.user?.id as string) ||
                "Unknown User",
              image: getAvatarUrl(user.data.user?.id as string),
            },
            token
          );

          const channel = client.channel("messaging", chatData.channel_id, {
            members: chatData.participants,
            name: `Task ${taskId}`,
          });
          setLoaded(true);
          setChannel(channel);
        } else {
          toast("No chat found");
        }
      } catch (error) {
        toast("An unexpected error occurred.");
        console.error("error", error);
      }
    };

    fetchChatInfo();
  }, [taskId, supabase, toast]);

  if (!loaded)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  const { theme } = useTheme();

  console.log("theme", theme);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        {task && (
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2">
                Task Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskDetail label="Title" value={task.title} />
                <TaskDetail label="Status" value={task.status} />
                <TaskDetail
                  label="Due"
                  value={formatDateTime(task.due_date, task.due_time)}
                />
                <TaskDetail
                  label="Description"
                  value={task.description || "No description"}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[600px]">
        <Chat
          client={client}
          theme={
            theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
          }
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

function TaskDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
