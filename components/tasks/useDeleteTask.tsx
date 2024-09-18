import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DeleteTaskResult {
  success: boolean;
  error: Error | null;
}

export default function useDeleteTask() {
  const deleteTask = async (taskId: number): Promise<DeleteTaskResult> => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { success: false, error: error as Error };
    } finally {
    }
  };

  return { deleteTask };
}
