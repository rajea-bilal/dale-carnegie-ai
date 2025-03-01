import { cn } from "@/lib/utils";
import { MessageBubbleProps } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator } from "./StatusIndicator";
import { AudioPlayer } from "./AudioPlayer";
import Image from "next/image";
import carnegieAvatarSrc from "@/assets/avatar.jpg";
import Markdown from "react-markdown";

// This component displays a single message in our chat
// It handles both user messages and Dale's (assistant) responses
export function MessageBubble({ message, isLastMessage }: MessageBubbleProps) {
  // Check if this message is from the user or Dale
  // We'll use this to style and position the message differently
  const isUser = message.role === "user";

  // If this is a status message (like "AI is thinking..."),
  // we show it in a special way using the StatusIndicator
  if (message.status) {
    return <StatusIndicator status={message.status} />;
  }

  // When Dale is still thinking and generating a response,
  // we show a loading skeleton to indicate something's coming
  if (isLastMessage && !message.content) {
    return (
      <div className="space-y-2">
        {/* Shows the three bouncing dots */}
        <StatusIndicator isLoading={true} />
        {/* Shows a gray box where the message will appear */}
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
          <Skeleton className="h-16 w-[200px]" />
        </div>
      </div>
    );
  }

  // This is the main message display
  return (
    // Wrapper that handles message positioning
    // User messages go to the right, Dale's to the left
    <div
      className={cn(
        "flex w-full gap-1.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Image
          src={carnegieAvatarSrc}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full w-10 h-10 flex-0"
        />
      )}

      {/* The actual message bubble */}
      {/* User messages are highlighted, Dale's are subtle */}
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary [&_*]:!text-primary-foreground" : "bg-muted"
        )}
      >
        {/* Container for message text and audio player */}
        <div className="flex items-start justify-between gap-2">
          {/* The actual message text */}
          <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none markdown-content">
            <Markdown>{message.content}</Markdown>
          </div>

          {/* Audio player only shows for Dale's messages */}
          {/* We also make sure there's actual content to speak */}
          {!isUser && message.content && (
            <AudioPlayer
              text={message.content}
              className="mt-1 ml-2 flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
