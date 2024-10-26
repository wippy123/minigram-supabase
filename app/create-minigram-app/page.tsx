"use client";

import { Chat } from "@/components/chat";
import { ChatInput } from "@/components/chat-input";
import { NavBar } from "@/components/navbar";
import { Preview } from "@/components/preview";
import { AuthViewType, useAuth } from "@/lib/auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Message, toAISDKMessages, toMessageImage } from "@/lib/messages";
import { LLMModelConfig } from "@/lib/models";
import modelsList from "@/lib/models.json";
import { FragmentSchema, fragmentSchema as schema } from "@/lib/schema";
import templates, { TemplateId } from "@/lib/templates";
import { ExecutionResult } from "@/lib/types";
import { DeepPartial } from "ai";
import { experimental_useObject as useObject } from "ai/react";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { CreateMinigraphModal } from "@/components/CreateMinigraphModal";
import { useRouter } from "next/navigation";

export default function Home() {
  const [chatInput, setChatInput] = useLocalStorage("chat", "");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedTemplate, _setSelectedTemplate] = useState<
    "auto" | TemplateId
  >("auto");
  const [languageModel, _setLanguageModel] = useLocalStorage<LLMModelConfig>(
    "languageModel",
    {
      model: "claude-3-5-sonnet-latest",
    }
  );

  const posthog = usePostHog();

  const [result, setResult] = useState<ExecutionResult>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fragment, setFragment] = useState<DeepPartial<FragmentSchema>>();
  const [currentTab, setCurrentTab] = useState<"code" | "fragment">("code");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isAuthDialogOpen, setAuthDialog] = useState(false);
  const [authView, setAuthView] = useState<AuthViewType>("sign_in");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { session, apiKey } = useAuth(setAuthDialog, setAuthView);

  const currentModel = modelsList.models.find(
    (model) => model.id === languageModel.model
  );
  const currentTemplate =
    selectedTemplate === "auto"
      ? templates
      : { [selectedTemplate]: templates[selectedTemplate] };
  const lastMessage = messages[messages.length - 1];

  const { object, submit, isLoading, stop, error } = useObject({
    api:
      currentModel?.id === "o1-preview" || currentModel?.id === "o1-mini"
        ? "/api/chat-o1"
        : "/api/chat",
    schema,
    onError: (error) => {
      if (error.message.includes("request limit")) {
        setIsRateLimited(true);
      }
    },
    onFinish: async ({ object: fragment, error }) => {
      if (!error) {
        // send it to /api/sandbox
        console.log("fragment", fragment);
        setIsPreviewLoading(true);
        posthog.capture("fragment_generated", {
          template: fragment?.template,
        });

        const response = await fetch("/api/sandbox", {
          method: "POST",
          body: JSON.stringify({
            fragment,
            userID: session?.user?.id,
            apiKey,
          }),
        });

        const result = await response.json();
        console.log("result", result);
        posthog.capture("sandbox_created", { url: result.url });

        setResult(result);
        setCurrentPreview({ fragment, result });
        setMessage({ result });
        setCurrentTab("fragment");
        setIsPreviewLoading(false);
      }
    },
  });

  useEffect(() => {
    if (object) {
      setFragment(object);
      const content: Message["content"] = [
        { type: "text", text: object.commentary || "" },
        { type: "code", text: object.code || "" },
      ];

      if (!lastMessage || lastMessage.role !== "assistant") {
        addMessage({
          role: "assistant",
          content,
          object,
        });
      }

      if (lastMessage && lastMessage.role === "assistant") {
        setMessage({
          content,
          object,
        });
      }
    }
  }, [object]);

  useEffect(() => {
    if (error) stop();
  }, [error]);

  function setMessage(message: Partial<Message>, index?: number) {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages];
      updatedMessages[index ?? previousMessages.length - 1] = {
        ...previousMessages[index ?? previousMessages.length - 1],
        ...message,
      };

      return updatedMessages;
    });
  }

  async function handleSubmitAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!session) {
      return setAuthDialog(true);
    }

    if (isLoading) {
      stop();
    }

    const content: Message["content"] = [
      {
        type: "text",
        text: chatInput,
      },
    ];
    const images = await toMessageImage(files);

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: "image", image });
      });
    }

    const updatedMessages = addMessage({
      role: "user",
      content,
    });

    submit({
      userID: session?.user?.id,
      messages: toAISDKMessages(updatedMessages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    });

    setChatInput("");
    setFiles([]);
    setCurrentTab("code");
    setTimeout(() => {
      setCurrentTab("code");
    }, 1500);

    posthog.capture("chat_submit", {
      template: selectedTemplate,
      model: languageModel.model,
    });
  }

  function retry() {
    submit({
      userID: session?.user?.id,
      messages: toAISDKMessages(messages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    });
  }

  function addMessage(message: Message) {
    setMessages((previousMessages) => [...previousMessages, message]);
    return [...messages, message];
  }

  function handleSaveInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value);
  }

  function handleFileChange(files: File[]) {
    setFiles(files);
  }

  function handleClearChat() {
    stop();
    setChatInput("");
    setFiles([]);
    setMessages([]);
    setFragment(undefined);
    setResult(undefined);
    setCurrentTab("code");
    setIsPreviewLoading(false);
  }

  function setCurrentPreview(preview: {
    fragment: DeepPartial<FragmentSchema> | undefined;
    result: ExecutionResult | undefined;
  }) {
    setFragment(preview.fragment);
    setResult(preview.result);
  }

  function handleUndo() {
    setMessages((previousMessages) => [...previousMessages.slice(0, -2)]);
    setCurrentPreview({ fragment: undefined, result: undefined });
  }

  const [publishedURL, setPublishedURL] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePublish = (url: string) => {
    console.log("handlePublish", url);
    setPublishedURL(url);
    setIsCreateModalOpen(true);
  };

  const router = useRouter();

  return (
    <main className="flex min-h-[90vh] max-h-[90vh]">
      <div className="grid w-full md:grid-cols-2">
        <div
          className={`flex flex-col w-full max-h-full max-w-[800px] mx-auto px-4 overflow-auto ${
            fragment ? "col-span-1" : "col-span-2"
          }`}
        >
          <NavBar
            onClear={handleClearChat}
            canClear={messages.length > 0}
            canUndo={messages.length > 1 && !isLoading}
            onUndo={handleUndo}
          />
          <div className="pt-[10px]">
            <Chat
              messages={messages}
              isLoading={isLoading}
              setCurrentPreview={setCurrentPreview}
            />
          </div>
          <ChatInput
            retry={retry}
            isErrored={error !== undefined}
            isLoading={isLoading}
            isRateLimited={isRateLimited}
            stop={stop}
            input={chatInput}
            handleInputChange={handleSaveInputChange}
            handleSubmit={handleSubmitAuth}
            isMultiModal={currentModel?.multiModal || false}
            files={files}
            handleFileChange={handleFileChange}
          >
            <></>
          </ChatInput>
        </div>
        <Preview
          apiKey={apiKey}
          selectedTab={currentTab}
          onSelectedTabChange={setCurrentTab}
          isChatLoading={isLoading}
          isPreviewLoading={isPreviewLoading}
          fragment={fragment}
          result={result as ExecutionResult}
          onClose={() => setFragment(undefined)}
          onPublish={handlePublish}
        />
      </div>
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] overflow-y-auto">
          <CreateMinigraphModal
            screenshotUrl={publishedURL || ""}
            onClose={() => {
              setIsCreateModalOpen(false);
              router.push("/minigraphs");
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
