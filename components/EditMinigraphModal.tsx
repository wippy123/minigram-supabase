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
import { useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { Minigraph } from "@/types/minigraph";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/types";

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
  bypassAdRemoval: z.boolean().default(true),
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
      bypassAdRemoval: true,
    },
    mode: "onChange",
  });

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toast.error("Failed to capture screenshot");
      } finally {
        setIsCapturingScreenshot(false);
      }
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = document.createElement("img") as HTMLImageElement;
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error: ErrorEvent) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return "";
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleCropImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        form.getValues("screenshot_url") || "",
        croppedAreaPixels
      );
      form.setValue("screenshot_url", croppedImage);
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
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
              <div className="relative h-[300px] w-full">
                <Cropper
                  image={form.watch("screenshot_url") || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-1/2"
                />
                <Button onClick={handleCropImage} type="button">
                  Crop Image
                </Button>
              </div>
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

          <Button type="submit" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "Updating..." : "Update Minigraph"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
