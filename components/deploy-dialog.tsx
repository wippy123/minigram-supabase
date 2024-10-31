import { publish } from "@/app/actions/publish";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Duration } from "@/lib/duration";
import { usePostHogInit } from "@/lib/hooks/usePostHogInit";
import { useEffect, useState } from "react";

export function DeployDialog({
  url,
  sbxId,
  apiKey,
  onPublish,
}: {
  url: string;
  sbxId: string;
  apiKey: string | undefined;
  onPublish: (publishedURL: string) => void;
}) {
  const posthog = usePostHogInit();
  const [publishedURL, setPublishedURL] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    setPublishedURL(null);
    setDuration("1h");
  }, [url]);

  async function publishURL(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const { url: publishedURL } = await publish(
        url,
        sbxId,
        duration as Duration,
        apiKey
      );
      setPublishedURL(publishedURL);
      onPublish(publishedURL); // Call the onPublish callback with the published URL
      posthog.capture("publish_url", {
        url: publishedURL,
      });
    } catch (error) {
      console.error("Error publishing URL:", error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default">Save Minigram</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-4 w-80 flex flex-col gap-2">
          <div className="text-sm font-semibold">Save</div>
          <div className="text-sm text-muted-foreground">
            Saving the minigram will make it available to you and your audience.
          </div>
          <form className="flex flex-col gap-2" onSubmit={publishURL}>
            <Button
              type="submit"
              variant="default"
              disabled={publishedURL !== null}
            >
              {publishedURL ? "Saved" : "Save"}
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
