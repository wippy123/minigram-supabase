import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import SubscriptionSection from "@/components/SubscriptionSection";

export default async function AccountSettingsPage() {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Profile</h1>
      <ProfileSettingsForm />
      <SubscriptionSection />
    </div>
  );
}
