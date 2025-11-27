import { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";


export function MessageWall({ messages, status, durations, onDurationChange }: { messages: UIMessage[]; status?: string; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!Array.isArray(messages)) {
        return null;
    }

    const safeMessages = (messages || []).map(msg => ({
        ...msg,
        content: typeof msg.content === "string" ? msg.content : "",
    }));

    return (
        <div className="relative max-w-[750px] w-full mx-auto">
            <div className="relative flex flex-col gap-4">
                {safeMessages.map((message, messageIndex) => {
                    const isLastMessage = messageIndex === safeMessages.length - 1;
                    return (
                        <div key={message.id || messageIndex} className="w-full">
                            {message.role === "user" ? (
                                <UserMessage message={message} />
                            ) : (
                                <AssistantMessage
                                    message={message}
                                    status={status}
                                    isLastMessage={isLastMessage}
                                    durations={durations}
                                    onDurationChange={onDurationChange}
                                />
                            )}
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
