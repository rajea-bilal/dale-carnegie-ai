"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Home, MessagesSquare } from "lucide-react";

const NavigationBar = () => {
  return (
    <div
      className={cn(
        "flex",
        "mt-8 mb-4",
        "bg-gray-200 rounded-lg",
        "border border-gray-300"
      )}
    >
      <Button variant="ghost">
        <Home />
      </Button>
      <Button variant="ghost">
        <MessagesSquare />
      </Button>
    </div>
  );
};

export default NavigationBar;
