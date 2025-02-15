import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Wallpaper from "@/components/ui/Wallpaper";
import { WallpaperProvider } from "@/context/WallpaperContext";

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
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${GeistSans.className} antialiased`}>
        <WallpaperProvider>
          <Wallpaper />
          {children}
        </WallpaperProvider>
      </body>
    </html>
  );
}
