import { FragmentCode } from "./fragment-code";
import { FragmentPreview } from "./fragment-preview";
import { DeployDialog } from "./deploy-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FragmentSchema } from "@/lib/schema";
import { ExecutionResult } from "@/lib/types";
import { DeepPartial } from "ai";
import { ChevronsRight, LoaderCircle } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function Preview({
  apiKey,
  selectedTab,
  onSelectedTabChange,
  isChatLoading,
  isPreviewLoading,
  fragment,
  result,
  onClose,
  onPublish,
}: {
  apiKey: string | undefined;
  selectedTab: "code" | "fragment";
  onSelectedTabChange: Dispatch<SetStateAction<"code" | "fragment">>;
  isChatLoading: boolean;
  isPreviewLoading: boolean;
  fragment?: DeepPartial<FragmentSchema>;
  result?: ExecutionResult;
  onClose: () => void;
  onPublish: (url: string) => void;
}) {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [result]);

  if (!fragment) {
    return null;
  }

  const isLinkAvailable = result?.template !== "code-interpreter-v1";

  return (
    <div className="absolute md:relative top-0 left-0 shadow-2xl md:rounded-3xl md:border bg-popover h-full w-full overflow-auto">
      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          onSelectedTabChange(value as "code" | "fragment")
        }
        className="h-full flex flex-col items-start justify-start"
      >
        <div className="w-full p-2 grid grid-cols-3 items-center border-b px-4">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={onClose}
                >
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex justify-center">
            <TabsList className="px-1 py-0 border h-8">
              <TabsTrigger
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="code"
              >
                {isChatLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
                Code
              </TabsTrigger>
              <TabsTrigger
                disabled={!result}
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="fragment"
              >
                Preview
                {isPreviewLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          {result && (
            <div className="flex items-center justify-end gap-2">
              {isLinkAvailable && (
                <DeployDialog
                  url={result.url!}
                  sbxId={result.sbxId!}
                  apiKey={apiKey}
                  onPublish={onPublish}
                />
              )}
            </div>
          )}
        </div>
        {fragment && (
          <div className="overflow-y-auto w-full h-full">
            <TabsContent value="code" className="h-full">
              {fragment.code && fragment.file_path && (
                <FragmentCode
                  files={[
                    {
                      name: fragment.file_path,
                      content: fragment.code,
                    },
                  ]}
                />
              )}
            </TabsContent>
            <TabsContent value="fragment" className="h-full">
              {result && showResult ? (
                <FragmentPreview result={result as ExecutionResult} />
              ) : result && !showResult ? (
                <div className="h-full w-full flex items-center justify-center">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
              ) : null}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
}
