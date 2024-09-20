"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Metadata } from "next";

interface AppSettings {
  id: string;
  company_name: string;
  company_address: string;
}

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching app settings:", error);
      toast.error("Failed to load app settings");
    } else {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const { error } = await supabase
      .from("app_settings")
      .update({
        company_name: settings.company_name,
        company_address: settings.company_address,
      })
      .eq("id", settings.id);

    if (error) {
      console.error("Error updating app settings:", error);
      toast.error("Failed to update app settings");
    } else {
      toast.success("App settings updated successfully");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings) {
    return <div>No settings found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">App Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block mb-1">
            Company Name
          </label>
          <Input
            id="company_name"
            name="company_name"
            value={settings.company_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="company_address" className="block mb-1">
            Company Address
          </label>
          <Input
            id="company_address"
            name="company_address"
            value={settings.company_address}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
