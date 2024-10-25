import React from "react";
import AuthForm from "./auth-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthViewType } from "@/lib/auth";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SupabaseClient } from "@supabase/supabase-js";

interface AuthDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  view: AuthViewType;
  supabase: any; // Replace with actual Supabase type
}

export function AuthDialog({ open, setOpen, view, supabase }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <VisuallyHidden>
          <DialogTitle>Sign in to E2B</DialogTitle>
        </VisuallyHidden>
        <AuthForm supabase={supabase} view={view} />
      </DialogContent>
    </Dialog>
  );
}
