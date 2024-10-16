"use client";

import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Instagram, Twitter } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
} from "@/components/ui/form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  purpose: z.string().min(2, "Purpose must be at least 2 characters"),
  url: z.string().url("Please enter a valid URL"),
  facebook: z.boolean().default(false),
  instagram: z.boolean().default(false),
  twitter: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function MinigraphForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      purpose: "",
      url: "",
      facebook: false,
      instagram: false,
      twitter: false,
    },
  });

  const url = watch("url");

  const generateScreenshot = async (urlToCapture: string) => {
    if (!urlToCapture) return;

    setIsGeneratingScreenshot(true);
    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToCapture }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate screenshot");
      }

      const data = await response.json();
      setScreenshotUrl(data.screenshot);
    } catch (error) {
      console.error("Error generating screenshot:", error);
      toast.error("Failed to generate screenshot");
    } finally {
      setIsGeneratingScreenshot(false);
    }
  };

  const handleUrlBlur = async () => {
    const isValid = await trigger("url");
    if (isValid && url) {
      generateScreenshot(url);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase.from("minigraphs").insert({
        user_id: userData.user.id,
        name: data.name,
        purpose: data.purpose,
        url: data.url,
        screenshot_url: screenshotUrl,
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
      });

      if (error) throw error;

      toast.success("Minigraph created successfully!");
      reset();
      setScreenshotUrl(null);
      router.push("/minigraphs"); // Assuming you have a page to list minigraphs
    } catch (error) {
      console.error("Error saving minigraph:", error);
      toast.error("Failed to create minigraph");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="name"
        register={register}
        errors={errors}
        render={({ field }: { field: FieldValues }) => (
          <>
            <FormLabel htmlFor="name">Name</FormLabel>
            <FormControl>
              <Input id="name" placeholder="Your name" {...field} />
            </FormControl>
          </>
        )}
      />

      <FormField
        name="purpose"
        register={register}
        errors={errors}
        render={({ field }: { field: FieldValues }) => (
          <>
            <FormLabel htmlFor="purpose">Purpose</FormLabel>
            <FormControl>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of your minigraph"
                {...field}
              />
            </FormControl>
          </>
        )}
      />

      <FormField
        name="url"
        register={register}
        errors={errors}
        render={({ field }: { field: FieldValues }) => (
          <>
            <FormLabel htmlFor="url">URL</FormLabel>
            <FormControl>
              <Input
                id="url"
                placeholder="https://yourwebsite.com"
                {...field}
                onBlur={handleUrlBlur}
              />
            </FormControl>
          </>
        )}
      />

      <div className="mt-4">
        <FormLabel>Screenshot Preview</FormLabel>
        <div className="mt-2 border rounded-lg overflow-hidden w-48 h-36 relative">
          {isGeneratingScreenshot ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <p className="text-sm text-gray-500">Generating...</p>
            </div>
          ) : screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt="Website Screenshot"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <p className="text-sm text-gray-500">Enter a URL</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <FormLabel>Social Media Platforms</FormLabel>
        <div className="flex space-x-4">
          <FormField
            name="facebook"
            register={register}
            errors={errors}
            render={({ field }: { field: FieldValues }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="facebook" {...field} />
                <FormLabel
                  htmlFor="facebook"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Facebook size={20} />
                </FormLabel>
              </div>
            )}
          />

          <FormField
            name="instagram"
            register={register}
            errors={errors}
            render={({ field }: { field: FieldValues }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="instagram" {...field} />
                <FormLabel
                  htmlFor="instagram"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Instagram size={20} />
                </FormLabel>
              </div>
            )}
          />

          <FormField
            name="twitter"
            register={register}
            errors={errors}
            render={({ field }: { field: FieldValues }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="twitter" {...field} />
                <FormLabel
                  htmlFor="twitter"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Twitter size={20} />
                </FormLabel>
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-6">
        {isSubmitting ? "Submitting..." : "Create Minigraph"}
      </Button>
    </Form>
  );
}
