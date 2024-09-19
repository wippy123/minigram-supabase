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
    return <div>Loading...</div>;
  }

  const { data: profileSettings } = await supabase
    .from("profile_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto mt-10 bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-5">Account Settings</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 border p-4 bg-white rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <ProfileSettingsForm initialData={profileSettings} />
        </div>
        <div className="w-full md:w-1/2 border p-4 bg-white rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
          <ResetPasswordForm />
        </div>
      </div>
      <div className="mt-10 bg-white p-4 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <SubscriptionSection />
      </div>
    </div>
  );
}
