"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import {
  UserIcon,
  HeartIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AccountSettings {
  display_name: string;
  title: string;
  preferences: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  avatar_url: string | null;
}

const themeOptions = ["light", "dark"];

export default function ProfileSettingsForm({
  initialData,
}: {
  initialData: AccountSettings;
}) {
  const [formData, setFormData] = useState<AccountSettings>(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { setTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string>("");

  const router = useRouter();

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAvatarFile(file);

      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Clean up the preview URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadAvatar = async (userId: string) => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar-image")
      .upload(filePath, avatarFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("avatar-image")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Error: User not authenticated");
      return;
    }

    let avatarUrl = formData.avatar_url;

    if (avatarFile) {
      try {
        avatarUrl = await uploadAvatar(user.id);
      } catch (error) {
        toast.error("Error uploading avatar");
        console.error(error);
        return;
      }
    }

    const updatedData = {
      display_name: formData.display_name,
      title: formData.title || null,
      preferences: formData.preferences,
      theme: formData.theme,
      email_notifications: formData.email_notifications,
      push_notifications: formData.push_notifications,
      avatar_url: avatarUrl,
    };

    const { error } = await supabase
      .from("profile_settings")
      .update(updatedData)
      .eq("id", user.id);

    if (error) {
      toast.error(`Error updating settings: ${error.message}`);
    } else {
      toast.success("Settings updated successfully!");
      setTheme(formData.theme);
      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: { avatarUrl } })
      );

      // Refresh the page to update the header
      router.refresh();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileSettings } = await supabase
          .from("profile_settings")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileSettings) {
          setFormData(profileSettings);
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
          {previewUrl || formData.avatar_url ? (
            <Image
              src={previewUrl || formData.avatar_url || ""}
              alt="Avatar"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-black dark:bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200">
          <CameraIcon className="h-5 w-5 inline-block mr-2" />
          Upload Profile Picture
          <input
            type="file"
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
        </label>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-gray-700 dark:text-gray-300"
        >
          Email
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 pointer-events-none">
            <EnvelopeIcon
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <input
            type="email"
            id="email"
            value={userEmail}
            disabled
            className="w-full pl-10 pt-2.5 pb-2 pr-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="title"
          className="block mb-2 text-gray-700 dark:text-gray-300"
        >
          Title
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 pointer-events-none">
            <AcademicCapIcon
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            className="w-full pl-10 pt-2.5 pb-2 pr-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="display_name"
          className="block mb-2 text-gray-700 dark:text-gray-300"
        >
          Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name || ""}
            onChange={handleChange}
            className="w-full pl-10 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="preferences"
          className="block mb-2 text-gray-700 dark:text-gray-300"
        >
          Preferences
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 pointer-events-none">
            <HeartIcon
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <textarea
            id="preferences"
            name="preferences"
            value={formData.preferences || ""}
            onChange={handleChange}
            className="w-full pl-10 pt-2.5 pb-2 pr-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="theme"
          className="block mb-2 text-gray-700 dark:text-gray-300"
        >
          Theme
        </label>
        <select
          id="theme"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {themeOptions.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="flex items-center text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="email_notifications"
            checked={formData.email_notifications}
            onChange={handleChange}
            className="mr-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
          Receive Email Notifications
        </label>
      </div>
      <div>
        <label className="flex items-center text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="push_notifications"
            checked={formData.push_notifications}
            onChange={handleChange}
            className="mr-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
          Receive Push Notifications
        </label>
      </div>
      <button
        type="submit"
        className="bg-black dark:bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        Save Changes
      </button>
    </form>
  );
}
