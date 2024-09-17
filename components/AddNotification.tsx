"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AddNotification({ userId }: { userId: string }) {
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      message: message.trim(),
    });

    if (error) {
      console.error("Error adding notification:", error);
    } else {
      setMessage("");
      // Optionally, you can add some feedback to the user here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter notification message"
        className="border p-2 mr-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Notification
      </button>
    </form>
  );
}
