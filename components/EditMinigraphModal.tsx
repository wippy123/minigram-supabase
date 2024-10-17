"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
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
});

type FormValues = z.infer<typeof formSchema>;

export default function EditMinigraphModal({
  minigraph,
  isOpen,
  onClose,
  onSuccess,
}: EditMinigraphModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
  });

  const onSubmit = async (data: FormValues) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Minigraph</DialogTitle>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <Input id="url" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="space-y-4 mt-4">
              <FormLabel htmlFor="">Social Media Platforms</FormLabel>
              <div className="flex space-x-4">
                <FormField
                  name="facebook"
                  register={form.register}
                  errors={form.formState.errors}
                  render={({ field }: { field: FieldValues }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="facebook" {...field} />
                      <FormLabel htmlFor="facebook">
                        <Facebook size={20} />
                      </FormLabel>
                    </div>
                  )}
                />

                <FormField
                  name="instagram"
                  register={form.register}
                  errors={form.formState.errors}
                  render={({ field }: { field: FieldValues }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="instagram" {...field} />
                      <FormLabel htmlFor="instagram">
                        <Instagram size={20} />
                      </FormLabel>
                    </div>
                  )}
                />

                <FormField
                  name="twitter"
                  register={form.register}
                  errors={form.formState.errors}
                  render={({ field }: { field: FieldValues }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="twitter" {...field} />
                      <FormLabel htmlFor="twitter">
                        <Twitter size={20} />
                      </FormLabel>
                    </div>
                  )}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Minigraph"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
