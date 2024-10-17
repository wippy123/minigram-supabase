"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldValues, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { Minigraph } from "@/types/minigraph";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";

interface EditMinigraphModalProps {
  minigraph: Minigraph;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  purpose: z.string().min(2, "Purpose must be at least 2 characters"),
  url: z.string().url("Please enter a valid URL"),
  facebook: z.boolean(),
  instagram: z.boolean(),
  twitter: z.boolean(),
  screenshot_url: z.string().url("Please enter a valid URL").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditMinigraphModal({
  minigraph,
  isOpen,
  onClose,
  onSuccess,
}: EditMinigraphModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const supabase = createClientComponentClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: minigraph.name,
      purpose: minigraph.purpose,
      url: minigraph.url,
      facebook: minigraph.facebook,
      instagram: minigraph.instagram,
      twitter: minigraph.twitter,
      screenshot_url: minigraph.screenshot_url || "",
    },
    mode: "onChange",
  });

  const onSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("minigraphs")
        .update({
          name: data.name,
          purpose: data.purpose,
          url: data.url,
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          screenshot_url: data.screenshot_url,
        })
        .eq("id", minigraph.id);

      if (error) throw error;

      toast.success("Minigraph updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating minigraph:", error);
      toast.error("Failed to update minigraph");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error("Failed to capture screenshot");
        }

        const data = await response.json();
        console.log("data", data);
        form.setValue("screenshot_url", data.screenshot);
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toast.error("Failed to capture screenshot");
      } finally {
        setIsCapturingScreenshot(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Minigraph</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
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
                  <Textarea id="purpose" {...field} />
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

          {isCapturingScreenshot && <p>Generating screenshot...</p>}

          {form.watch("screenshot_url") && (
            <div className="mt-4">
              <Image
                src={form.watch("screenshot_url") || ""}
                alt="Minigraph Screenshot"
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
          )}

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

          <Button type="submit" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "Updating..." : "Update Minigraph"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}