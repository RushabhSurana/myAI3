"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { useEffect, useState, useRef } from "react";
import { CLEAR_CHAT_TEXT, WELCOME_MESSAGE } from "@/config";
import { ClientOnly } from "@/components/client-only";
import Image from "next/image";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type StorageData = {
  messages: ChatMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: ChatMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: ChatMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export default function Chat() {
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = loadMessagesFromStorage();
    setDurations(stored.durations);
    if (stored.messages.length > 0) {
      setLocalMessages(stored.messages);
    } else {
      const welcomeMessage: ChatMessage = {
        id: "welcome-message",
        role: "assistant",
        content: WELCOME_MESSAGE,
      };
      setLocalMessages([welcomeMessage]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveMessagesToStorage(localMessages, durations);
    }
  }, [durations, localMessages, isInitialized]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const userMessage = data.message.trim();
    if (!userMessage || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };
    
    const updatedMessages = [...localMessages, userMsg];
    setLocalMessages(updatedMessages);
    setIsLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    })
      .then(async res => {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return res.json();
        }
        const text = await res.text();
        return { role: "assistant", content: text };
      })
      .then(data => {
        if (!data) return;
        const assistantMsg: ChatMessage = {
          id: data.id || crypto.randomUUID(),
          role: data.role || "assistant",
          content: data.content || "",
        };
        setLocalMessages(prev => [...prev, assistantMsg]);
      })
      .catch(err => {
        console.error("Chat request failed:", err);
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        setLocalMessages(prev => [...prev, errorMsg]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    form.reset();
  }

  function clearChat() {
    const welcomeMessage: ChatMessage = {
      id: "welcome-message",
      role: "assistant",
      content: "Welcome to PILLMETRIX. Ask me about pharma companies, financials, and I'll ground answers in your documents.",
    };
    setLocalMessages([welcomeMessage]);
    setDurations({});
    saveMessagesToStorage([welcomeMessage], {});
    toast.success("Chat cleared");
  }

  return (
    <div className="flex h-screen items-center justify-center font-sans bg-[#F5F7FA] text-[#111]">
      <main className="w-full h-screen relative">
        <div className="fixed top-0 left-0 right-0 z-50 overflow-visible pb-10">
          <div className="relative overflow-visible">
            <ChatHeader>
              <ChatHeaderBlock className="justify-center items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="PILLMETRIX Logo" 
                  width={48} 
                  height={48}
                  className="h-12 w-12 shadow-sm"
                />
                <div className="flex flex-col leading-tight">
                  <p className="text-lg font-semibold tracking-tight">PILLMETRIX</p>
                </div>
              </ChatHeaderBlock>
              <ChatHeaderBlock className="justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-full border border-[#ddd] text-[#111] shadow-sm"
                  onClick={clearChat}
                >
                  <Plus className="size-4" />
                  {CLEAR_CHAT_TEXT}
                </Button>
              </ChatHeaderBlock>
            </ChatHeader>
          </div>
        </div>
        <div className="h-screen overflow-y-auto px-5 py-4 w-full pt-[88px] pb-[150px]">
          <div className="flex flex-col items-center justify-end min-h-full">
            <ClientOnly
              fallback={
                <div className="flex justify-center max-w-2xl w-full">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <MessageWall 
                messages={localMessages} 
                status={isLoading ? "streaming" : "ready"} 
                durations={durations} 
                onDurationChange={handleDurationChange} 
              />
              {isLoading && (
                <div className="flex justify-start max-w-3xl w-full">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </ClientOnly>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent overflow-visible pt-6 pb-4">
          <div className="w-full px-5 items-center flex justify-center relative overflow-visible">
            <div className="max-w-[750px] w-full">
              <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="chat-form-message" className="sr-only">
                          Message
                        </FieldLabel>
                        <div className="relative h-13">
                          <Input
                            {...field}
                            id="chat-form-message"
                            className="h-14 pr-14 pl-5 bg-white rounded-full border border-[#ddd] shadow-sm text-base"
                            placeholder="Type your message here..."
                            disabled={isLoading}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />
                          {!isLoading && (
                            <Button
                              className="absolute right-2.5 top-2.5 rounded-full bg-[#19c3db] hover:bg-[#17b2c7] text-white shadow-sm"
                              type="submit"
                              disabled={!field.value.trim()}
                              size="icon"
                            >
                              <ArrowUp className="size-5" />
                            </Button>
                          )}
                          {isLoading && (
                            <Button
                              className="absolute right-2 top-2 rounded-full"
                              size="icon"
                              type="button"
                            >
                              <Square className="size-4" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>
          <div className="w-full px-5 py-3 items-center flex justify-center text-xs text-muted-foreground">
            © 2025 PILLMETRIX • Built by Rushabh Surana & Samakshi Garg
          </div>
        </div>
      </main>
    </div>
  );
}
