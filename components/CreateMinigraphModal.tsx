"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MinigraphForm from "@/app/minigraph/minigraph-form";
import { useState } from "react";

interface CreateMinigraphModalProps {
  onSuccess: () => void;
}

export default function CreateMinigraphModal({
  onSuccess,
}: CreateMinigraphModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      onSuccess();
    } catch (error) {
      console.error("Error creating minigram:", error);
      setError("Failed to create minigram. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Create New Minigram</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <MinigraphForm onSubmit={handleSubmit} />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
