"use client";
import { motion, Variants } from "motion/react";
import { useAnimationDelay } from "@/hooks/useAnimationDelay";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { AudioPlayer } from "./AudioPlayer";

export function AnimatedMessage({
  message,
  isLastMessage,
  index = 0,
}: {
  message: Message;
  isLastMessage?: boolean;
  index?: number;
}) {
  const isUser = message.role === "user";
  const isWelcome = message.id === "welcome";
  const isVisible = useAnimationDelay((index * 1000) + 1000);

  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        mass: 1,
        staggerChildren: 0.1,
      },
    },
  };

  const contentVariants: Variants = {
    hidden: {
      opacity: 0,
      x: isUser ? 20 : -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const highlightVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: isWelcome ? [0, 1, 0.2] : [0, 0.1, 0],
      scale: 1,
      transition: {
        opacity: {
          times: [0, 0.2, 1],
          duration: isWelcome ? 2 : 1,
        },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 20,
        },
      },
    },
  };

  return (
    <motion.div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <motion.div
        className={cn(
          "absolute -inset-2 rounded-xl blur-xl",
          isWelcome ? "bg-primary/5" : isUser ? "bg-primary/5" : "bg-muted/5"
        )}
        variants={highlightVariants}
      />
      <motion.div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] relative",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted border border-border/5",
          isWelcome && "border-primary/10"
        )}
        variants={contentVariants}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="relative z-10 break-words">{message.content}</div>
          <div className="mt-1 shrink-0">
            <AudioPlayer url={message.audio} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
