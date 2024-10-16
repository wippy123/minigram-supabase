"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MinigraphForm from "@/app/minigraph/minigraph-form";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

interface CreateMinigraphModalProps {
  onSuccess: () => void;
}

export default function CreateMinigraphModal({
  onSuccess,
}: CreateMinigraphModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // ... (existing create minigraph logic)

      // After successful creation
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
    </div>
  );
}
