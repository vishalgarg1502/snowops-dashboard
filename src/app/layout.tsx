import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnowOps Intelligence Dashboard | Oakville Public Works",
  description:
    "AI-powered fleet intelligence dashboard for Oakville's 20-vehicle snow operations fleet. Live map, efficiency scoreboard, and Gemini-powered Q&A.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900`}>{children}</body>
    </html>
  );
}
