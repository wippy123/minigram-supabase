"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MinigraphForm from "@/app/minigraph/minigraph-form";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
      console.error("Error creating minigraph:", error);
      setError("Failed to create minigraph. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Create New Minigraph</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <MinigraphForm onSubmit={handleSubmit} />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}