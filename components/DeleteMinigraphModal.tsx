import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minigraph } from "@/types/minigraph";

interface DeleteMinigraphModalProps {
  minigraph: Minigraph;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMinigraphModal({
  minigraph,
  isOpen,
  onClose,
  onConfirm,
}: DeleteMinigraphModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Minigraph</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the minigraph "{minigraph.name}"?</p>
        <p>This action cannot be undone.</p>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
