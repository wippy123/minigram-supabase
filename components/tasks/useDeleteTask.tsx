"use client";

import { useState } from "react";

export default function useDeleteTask() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to delete task.");
      } else {
        // Optionally, trigger a re-fetch or update state
        window.location.reload();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
}
