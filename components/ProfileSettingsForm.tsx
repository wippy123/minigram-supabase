"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "@/contexts/ThemeContext";

interface AccountSettings {
  display_name: string;
  bio: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean; // New field
  _id: string;
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

    const updatedData = {
      ...formData,
    };

    const { error } = await supabase
      .from("account_settings")
      .update(updatedData)
      .eq("id", userId);

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
        const { data: accountSettings, error } = await supabase
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
        <label htmlFor="display_name" className="block mb-2">
          Display Name
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          value={formData.display_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
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
