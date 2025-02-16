import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Wallpaper from "@/components/ui/Wallpaper";
import { WallpaperProvider } from "@/contexts/WallpaperContext";
import NavigationBar from "@/components/navigation/bar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Dale Carnegie AI",
  description: "AI-powered chat interface for Dale Carnegie's principles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${GeistSans.className} antialiased`}>
          <WallpaperProvider>
            <Wallpaper />
            <div className="flex flex-col h-screen">
              {children}
              <NavigationBar />
            </div>
          </WallpaperProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
