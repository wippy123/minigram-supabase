"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 100, aspect: 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg");
    });
  };

  const handleCropComplete = async (crop: Crop) => {
    if (image) {
      const img = new Image();
      img.src = image;
      const croppedImageBlob = await getCroppedImg(img, crop);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const handleUpload = async () => {
    if (croppedImageUrl) {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const fileName = `${uuidv4()}.jpg`;
      const { data, error } = await supabase.storage
        .from("app-images")
        .upload(fileName, blob);

      if (error) {
        console.error("Error uploading image:", error);
      } else {
        const { data: urlData } = supabase.storage
          .from("app-images")
          .getPublicUrl(fileName);
        onImageUploaded(urlData.publicUrl);
      }
    }
  };

  return (
    <div className="space-y-4">
      {!image && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>Drag 'n' drop an image here, or click to select one</p>
          )}
        </div>
      )}
      {image && (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={handleCropComplete}
          aspect={1}
        >
          <img src={image} alt="Upload" />
        </ReactCrop>
      )}
      {croppedImageUrl && (
        <div>
          <h3>Preview:</h3>
          <img
            src={croppedImageUrl}
            alt="Cropped"
            className="max-w-full h-auto"
          />
        </div>
      )}
      {image && (
        <Button onClick={handleUpload} disabled={!croppedImageUrl}>
          Upload Image
        </Button>
      )}
    </div>
  );
}
