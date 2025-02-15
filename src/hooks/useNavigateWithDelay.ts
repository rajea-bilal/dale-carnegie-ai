import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallpaper } from "@/contexts/WallpaperContext";

interface UseNavigateWithDelayProps {
  path: string;
  delay?: number;
  shouldNavigate?: () => boolean;
  onReset?: () => void;
}

export const useNavigateWithDelay = ({
  path,
  delay = 1000,
  shouldNavigate = () => true,
  onReset,
}: UseNavigateWithDelayProps) => {
  const router = useRouter();
  const { isPlaying, setIsPlaying } = useWallpaper();

  const handleNavigate = (e: React.MouseEvent) => {
    if (!shouldNavigate()) return;

    e.preventDefault();
    setIsPlaying(true);
    setTimeout(() => {
      router.push(path);
      setTimeout(() => {
        setIsPlaying(false);
        onReset?.();
      }, 2000);
    }, delay);
  };

  return {
    isPlaying,
    handleNavigate,
  };
};
