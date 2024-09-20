"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import SubscriptionSection from "@/components/SubscriptionSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    return (
      <div className="flex justify-center items-center h-screen text-gray-800 dark:text-gray-200">
        Loading...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-800 dark:text-gray-200">
        No settings found
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-2 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">App Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Company Name
                </label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="company_address"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Company Address
                </label>
                <Input
                  id="company_address"
                  name="company_address"
                  value={settings.company_address}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <Button type="submit" className="w-full">
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <SubscriptionSection />
      </div>
    </div>
  );
}
