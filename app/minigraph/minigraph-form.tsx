"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  purpose: z.string().min(2, "Purpose must be at least 2 characters"),
  url: z.string().url("Please enter a valid URL"),
  facebook: z.boolean(),
  instagram: z.boolean(),
  twitter: z.boolean(),
  screenshot_url: z.string().url("Please enter a valid URL").optional(),
  bypassAdRemoval: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface MinigraphFormProps {
  onSubmit: () => Promise<void>;
  initialValues?: Partial<FormValues>;
  url?: string;
}

export default function MinigraphForm({
  onSubmit,
  initialValues,
  url,
}: MinigraphFormProps) {
  const supabase = createClientComponentClient();
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(
    url || null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      purpose: "",
      url: url || "",
      facebook: false,
      instagram: false,
      twitter: false,
      screenshot_url: screenshotUrl || "",
      bypassAdRemoval: true,
      ...initialValues,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (url) {
      handleUrlBlur();
    }
  }, []);

  useEffect(() => {
    if (screenshotUrl) {
      form.setValue("screenshot_url", screenshotUrl);
    }
  }, [screenshotUrl, form]);

  const handleUrlBlur = async () => {
    const url = form.getValues("url");
    if (url) {
      setIsCapturingScreenshot(true);
      try {
        const response = await fetch("/api/screenshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            bypassAdRemoval: form.getValues("bypassAdRemoval"),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to capture screenshot");
        }

        const data = await response.json();
        form.setValue("screenshot_url", data.screenshot);
        setScreenshotUrl(data.screenshot);
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toast.error("Failed to capture screenshot");
      } finally {
        setIsCapturingScreenshot(false);
      }
    }
  };

  const onSubmitHandler = async (data: FormValues) => {
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
        screenshot_url: form.getValues("screenshot_url"),
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
      });

      if (error) throw error;

      toast.success("Minigram created successfully!");
      form.reset();
      setScreenshotUrl(null);
      onSubmit();
    } catch (error) {
      console.error("Error saving minigram:", error);
      toast.error("Failed to create minigram");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
      <FormField
        name="name"
        register={form.register}
        errors={form.formState.errors}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="name">Name</FormLabel>
            <FormControl>
              <Input id="name" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name="purpose"
        register={form.register}
        errors={form.formState.errors}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="purpose">Purpose</FormLabel>
            <FormControl>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of your minigraph"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name="url"
        register={form.register}
        errors={form.formState.errors}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="url">URL</FormLabel>
            <FormControl>
              <Input
                id="url"
                placeholder="https://yourwebsite.com"
                {...field}
                onBlur={(e) => {
                  field.onBlur(e);
                  handleUrlBlur();
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex items-center space-x-2">
        <Controller
          name="bypassAdRemoval"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id="bypassAdRemoval"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="bypassAdRemoval">Bypass Ad Removal</Label>
      </div>

      {isCapturingScreenshot ? (
        <div className="mt-4 h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-gray-500">Generating screenshot...</p>
        </div>
      ) : form.watch("screenshot_url") ? (
        <div className="mt-4">
          <img
            src={form.watch("screenshot_url")}
            alt="Screenshot"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      ) : null}

      <div className="space-y-4 mt-4">
        <FormLabel htmlFor="">Social Media Platforms</FormLabel>
        <div className="flex space-x-4">
          <Controller
            name="facebook"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="facebook"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel htmlFor="facebook">
                  <Facebook size={20} />
                </FormLabel>
              </div>
            )}
          />
          <Controller
            name="instagram"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instagram"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel htmlFor="instagram">
                  <Instagram size={20} />
                </FormLabel>
              </div>
            )}
          />
          <Controller
            name="twitter"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="twitter"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel htmlFor="twitter">
                  <Twitter size={20} />
                </FormLabel>
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
