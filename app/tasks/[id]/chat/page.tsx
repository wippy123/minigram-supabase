"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useState } from "react";
import { useEffect } from "react";
import { StreamChat, StreamChannel } from "stream-chat";
import { getAvatarUrl } from "@/utils/utils";
import {
  useCreateChatClient,
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { EmojiPicker } from "stream-chat-react/emojis";

import { init, SearchIndex } from "emoji-mart";
import data from "@emoji-mart/data";

export default function ChatPage() {
  const supabase = createClientComponentClient();
  const [loaded, setLoaded] = useState(false);
  const client = StreamChat.getInstance("49wdm2zxn2xb");
  const [channel, setChannel] = useState<StreamChannel>();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !userId || !loaded) return;
    console.log("userId", userId);
    const channel = client.channel("messaging", {
      members: [
        "21ef481d-fd7d-449b-b856-0eb98f275cf2",
        "d6fc2c09-7064-4260-b4d3-36d9352163d5",
      ],
      name: "Awesome channel about traveling",
    });

    setChannel(channel);
  }, [client, loaded, userId]);

  const makeChatChannel = async () => {
    try {
      const user = await supabase.auth.getUser();
      setUserId(user.data.user?.id as string);
      const token = await getStreamToken(user.data.user?.id as string);
      await client.connectUser(
        {
          id: user.data.user?.id,
          name: "Jimbo Jones",
          image: getAvatarUrl(user.data.user?.id as string),
        },
        token
      );
      console.log("loaded", token);
      setLoaded(true);
    } catch (error) {
      console.log("error", error);
    }
  };

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
    makeChatChannel();
  }, []);

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
