import Logo from "./logo";
import { CopyButton } from "./ui/copy-button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { publish } from "@/app/actions/publish";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Duration } from "@/lib/duration";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

export function DeployDialog({
  url,
  sbxId,
  apiKey,
}: {
  url: string;
  sbxId: string;
  apiKey: string | undefined;
}) {
  const posthog = usePostHog();

  const [publishedURL, setPublishedURL] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    setPublishedURL(null);
    setDuration("1h");
  }, [url]);

  async function publishURL(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { url: publishedURL } = await publish(
      url,
      sbxId,
      duration as Duration,
      apiKey
    );
    setPublishedURL(publishedURL);
    posthog.capture("publish_url", {
      url: publishedURL,
    });
  }

  return (
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
          {/* {publishedURL ? (
            <div className="flex items-center gap-2">
              <Input value={publishedURL} readOnly />
              <CopyButton content={publishedURL} />
            </div>
          ) : (
            <Select onValueChange={(value) => setDuration(value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Set expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Expires in</SelectLabel>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="3h">3 Hours · Pro</SelectItem>
                  <SelectItem value="6h">6 Hours · Pro</SelectItem>
                  <SelectItem value="1d">1 Day · Pro</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )} */}
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
  );
}
