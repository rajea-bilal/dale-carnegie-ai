import { AnimatedCard, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

interface ChatCardProps {
  children: ReactNode;
  className?: string;
}

export function ChatCard({ children, className }: ChatCardProps) {
  const { currentChat, searchQuery } = useChatContext();

  return (
    <AnimatedCard
      delay={500}
      variant="Rotate"
      className={cn(
        "w-full flex flex-col bg-background/80 backdrop-blur-sm border-background/20 shadow-xl",
        className
      )}
      animationDisabled={!!searchQuery}
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{currentChat?.title}</h2>
      </div>
      {children}
    </AnimatedCard>
  );
}
