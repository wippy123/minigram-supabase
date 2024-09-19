import { ReactNode } from "react";

export default function AccountSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Personal Information</h1>
      {children}
    </div>
  );
}
