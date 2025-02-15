import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { useAnimationDelay } from "@/hooks/useAnimationDelay";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "SlideDown" | "Rotate";
    delay?: number;
  }
>(({ className, variant = "SlideDown", delay = 0, ...props }, ref) => {
  const enabled = useAnimationDelay(delay);

  const variants = {
    SlideDown: {
      initial: { height: 0, opacity: 0 },
      animate: {
        height: "auto",
        opacity: 1,
        transition: {
          height: { type: "spring", stiffness: 100, damping: 20 },
          opacity: { duration: 0.2 },
        },
      },
      exit: {
        height: 0,
        opacity: 0,
        transition: {
          height: { type: "spring", stiffness: 100, damping: 20 },
          opacity: { duration: 0.2 },
        },
      },
    },
    Rotate: {
      initial: {
        rotate: -48,
        scale: 0.4,
        opacity: 0,
      },
      animate: {
        rotate: 0,
        scale: 1,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 22,
        },
      },
      exit: {
        rotate: 10,
        scale: 0.9,
        opacity: 0,
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 20,
        },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        variant === "SlideDown" && "overflow-hidden",
        className
      )}
      initial="initial"
      animate={enabled ? "animate" : "initial"}
      exit="exit"
      variants={variants[variant]}
      {...props}
    />
  );
});
AnimatedCard.displayName = "AnimatedCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  AnimatedCard,
};
