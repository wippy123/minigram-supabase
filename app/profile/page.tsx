import React from "react";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import SubscriptionSection from "@/components/SubscriptionSection";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function AccountSettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  const { data: profileSettings } = await supabase
    .from("profile_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-gray-100">
        Profile
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Personal Information
          </h2>
          <ProfileSettingsForm initialData={profileSettings} />
        </div>
        <div className="w-full md:w-1/2 border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Reset Password
          </h2>
          <ResetPasswordForm />
        </div>
      </div>
      <div className="mt-10 border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Subscription
        </h2>
        <SubscriptionSection />
      </div>
    </div>
  );
}
