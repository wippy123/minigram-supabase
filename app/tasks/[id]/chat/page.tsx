"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useState, useEffect } from "react";
import { StreamChat, StreamChannel } from "stream-chat";
import { useParams } from "next/navigation";
import { getAvatarUrl } from "@/utils/utils";
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
// import data from "@emoji-mart/data";

export default function ChatPage() {
  const supabase = createClientComponentClient();
  const [loaded, setLoaded] = useState(false);
  const client = StreamChat.getInstance("49wdm2zxn2xb");
  const [channel, setChannel] = useState<StreamChannel>();
  const [userId, setUserId] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);
  // Use the useParams hook to get the task ID from the URL
  const params = useParams();
  const taskId = params.id as string;

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

  if (!loaded) return <div>Loading...</div>;

  return (
    <Chat client={client}>
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
  );
}
