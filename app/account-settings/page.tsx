import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccountSettingsForm from "@/components/AccountSettingsForm";
import SubscriptionSection from "@/components/SubscriptionSection";

export default async function AccountSettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: accountSettings, error } = await supabase
    .from("account_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching account settings:", error);
    return <div>Error loading account settings</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Account Settings</h1>
      <AccountSettingsForm initialData={accountSettings} userId={user.id} />
      <SubscriptionSection />
    </div>
  );
}
