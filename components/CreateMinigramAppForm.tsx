"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast"; // Updated import for react-hot-toast
import { Loader2 } from "lucide-react";
import { Fragment } from "react";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

export default function CreateMinigramAppForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [containerLink, setContainerLink] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // TODO: Implement the actual e2b SDK integration here
      // This is a placeholder for the e2b SDK call
      const response = await fetch("/api/create-minigram-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create Minigram app");
      }

      const data = await response.json();
      setContainerLink(data.containerLink);
      toast.success("Minigram app created successfully!"); // Using react-hot-toast
      router.push(`/minigraph/${data.id}`);
    } catch (error) {
      console.error("Error creating Minigram app:", error);
      toast.error("Failed to create Minigram app. Please try again."); // Using react-hot-toast
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        name="prompt"
        register={form.register}
        errors={form.formState.errors}
        render={({ field }) => (
          <Textarea
            placeholder="Enter detailed instructions for your Minigram app (e.g., desired features, functionality, design preferences)"
            className="min-h-[200px]"
            {...field}
          />
        )}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Minigram App
      </Button>
      {containerLink && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Your Minigram App is Ready!
          </h2>
          <p>
            Access your app here:{" "}
            <a
              href={containerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {containerLink}
            </a>
          </p>
        </div>
      )}
    </Form>
  );
}
