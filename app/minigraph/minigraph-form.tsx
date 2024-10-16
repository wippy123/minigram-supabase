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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  purpose: z.string().min(2, "Purpose must be at least 2 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
  url: z.string().url("Please enter a valid URL"),
  facebook: z.boolean().default(false),
  instagram: z.boolean().default(false),
  twitter: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function MinigraphForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      purpose: "",
      imageUrl: "",
      url: "",
      facebook: false,
      instagram: false,
      twitter: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Here you would typically send the data to your backend
    console.log(data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    // Reset form after successful submission
    reset();
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
        name="imageUrl"
        register={register}
        errors={errors}
        render={({ field }: { field: FieldValues }) => (
          <>
            <FormLabel htmlFor="imageUrl">Image URL</FormLabel>
            <FormControl>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                {...field}
              />
            </FormControl>
            <FormDescription>Enter the URL of your image</FormDescription>
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
              />
            </FormControl>
          </>
        )}
      />

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
