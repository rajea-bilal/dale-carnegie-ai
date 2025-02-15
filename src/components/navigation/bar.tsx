"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Home, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const NavigationBar = () => {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isChatActive = pathname === "/chat";

  const linkStyles = "hover:bg-white/20 hover:text-white [&.active:hover]:bg-black";

  return (
    <div
      className={cn(
        "flex z-20 mx-auto",
        "mt-8 mb-4 relative",
        "bg-gray-200 rounded-lg",
        "border border-gray-300"
      )}
    >
      <Cursor activeIndex={isHomeActive ? 0 : 1} />
      <div className="z-10 text-white flex mix-blend-difference">
        <Button asChild variant="ghost">
          <Link href="/" className={cn(linkStyles, isHomeActive && "active")}>
            <Home />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/chat" className={cn(linkStyles, isChatActive && "active")}>
            <MessagesSquare />
          </Link>
        </Button>
      </div>
    </div>
  );
};

const Cursor = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <motion.div
      className={cn("absolute z-0 h-full bg-black w-1/2 rounded-lg")}
      animate={{ left: activeIndex === 0 ? 0 : "50%" }}
    />
  );
};

export default NavigationBar;
