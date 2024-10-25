import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash, Undo, Info } from "lucide-react";

export function NavBar({
  onClear,
  canClear,
  onUndo,
  canUndo,
}: {
  onClear: () => void;
  canClear: boolean;
  onUndo: () => void;
  canUndo: boolean;
}) {
  return (
    <nav className="w-full flex justify-between items-center bg-background py-4 px-6">
      <div className="flex items-center gap-1 md:gap-4">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={!canClear}
              >
                <Trash className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <h1 className="text-lg font-semibold">Create a Minigram</h1>

      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span className="hidden md:inline">Describe your app</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                Enter a detailed description of the app you want to generate. Be
                specific about features, design, and functionality.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
