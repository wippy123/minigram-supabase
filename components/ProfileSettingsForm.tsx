"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { UserIcon, HeartIcon } from "@heroicons/react/24/outline";

interface AccountSettings {
  display_name: string;
  title: string;
  bio: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

const themeOptions = [
  "light",
  "dark",
  "zinc",
  "slate",
  "stone",
  "gray",
  "neutral",
  "red",
  "rose",
  "orange",
  "green",
  "blue",
  "yellow",
  "violet",
];

export default function ProfileSettingsForm({
  initialData,
}: {
  initialData: AccountSettings;
}) {
  const [formData, setFormData] = useState<AccountSettings>(initialData);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { setTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Error: User not authenticated");
      return;
    }

    const updatedData = {
      display_name: formData.display_name,
      title: formData.title || null,
      bio: formData.bio,
      theme: formData.theme,
      email_notifications: formData.email_notifications,
      push_notifications: formData.push_notifications,
    };

    const { error } = await supabase
      .from("account_settings")
      .update(updatedData)
      .eq("id", user.id);

    if (error) {
      setMessage(`Error updating settings: ${error.message}`);
    } else {
      setMessage("Settings updated successfully!");
      setTheme(formData.theme);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: accountSettings } = await supabase
          .from("account_settings")
          .select("*")
          .eq("id", user.id)
          .single();

        if (accountSettings) {
          setFormData(accountSettings);
        }

        setUserEmail(user.email as string);
      }
    };

    fetchData();
  }, []);

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={userEmail}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>
      <div>
        <label htmlFor="title" className="block mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="display_name" className="block mb-2">
          Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon
              className="h-5 w-5 text-white stroke-black stroke-2"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name || ""}
            onChange={handleChange}
            className="w-full pl-10 p-2 border rounded"
          />
        </div>
      </div>
      <div>
        <label htmlFor="preferences" className="block mb-2">
          Preferences
        </label>
        <div className="relative">
          <div className="absolute top-0 left-0 pt-2 pl-3 pointer-events-none">
            <HeartIcon
              className="h-5 w-5 text-white stroke-black stroke-2"
              aria-hidden="true"
            />
          </div>
          <textarea
            id="preferences"
            name="bio" // Keep the name as "bio" for database consistency
            value={formData.bio || ""}
            onChange={handleChange}
            className="w-full pl-10 p-2 border rounded"
            rows={3}
          />
        </div>
      </div>
      <div>
        <label htmlFor="theme" className="block mb-2">
          Theme
        </label>
        <select
          id="theme"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          {themeOptions.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="email_notifications"
            checked={formData.email_notifications}
            onChange={handleChange}
            className="mr-2"
          />
          Receive Email Notifications
        </label>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="push_notifications"
            checked={formData.push_notifications}
            onChange={handleChange}
            className="mr-2"
          />
          Receive Push Notifications
        </label>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Save Settings
      </button>
      {message && (
        <p
          className={
            message.includes("Error") ? "text-red-500" : "text-green-500"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
