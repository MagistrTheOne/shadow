import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { ToasterProvider } from "@/components/toaster-provider";
import { LanguageProvider } from "@/contexts/language-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

 

export const metadata: Metadata = {
  title: "Shadow.Ai",
  description: "New Ai Agents for Future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <LanguageProvider>
        <html lang="en">
          <body
            className={`${inter.className}   antialiased`}
          >
            {children}
            <ToasterProvider />
          </body>
        </html>
      </LanguageProvider>
    </TRPCReactProvider>
  );
}
