"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Home, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { useNavigateWithDelay } from "@/hooks/useNavigateWithDelay";
import { useState } from "react";

const NavigationBar = () => {
  const [isChatClicked, setIsChatClicked] = useState(false);
  const pathname = usePathname();
  const { wasPlayed } = useWallpaper();
  const { handleNavigate } = useNavigateWithDelay({
    path: "/chat",
    shouldNavigate: () => !pathname.includes("/chat") && !wasPlayed,
    onReset: () => setIsChatClicked(false),
  });

  const isHomeActive = !isChatClicked && pathname === "/";
  const isChatActive = isChatClicked || pathname === "/chat";

  const handleChatClick = (e: React.MouseEvent) => {
    handleNavigate(e);
    setIsChatClicked(true);
  };

  const linkStyles =
    "hover:bg-white/20 hover:text-white [&.active:hover]:bg-black";

  return (
    <div
      className={cn(
        "flex z-20 mx-auto",
        "mt-7 mb-6 relative",
        "bg-gray-200 rounded-lg",
        "border border-gray-300",
        isChatClicked && "pointer-events-none"
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
          <Link
            href="/chat"
            onClick={handleChatClick}
            className={cn(linkStyles, isChatActive && "active")}
          >
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
