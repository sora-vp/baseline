import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@sora-vp/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sora-vp/ui/resizable";
import { ThemeProvider, ThemeToggle } from "@sora-vp/ui/theme";
import { Toaster } from "@sora-vp/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  title: "sora baseline | aplikasi pemilihan",
  description: "Aplikasi pemilihan ketua yang baru.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const sundaneseFont = localFont({
  src: "./fonts/NotoSansSundanese-Regular.ttf",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-screen w-screen"
          >
            <ResizablePanel minSize={6} defaultSize={17} maxSize={20}>
              <div className="flex items-center justify-center p-6 text-4xl">
                <span className={`${sundaneseFont.className}`}>ᮞᮧᮛ</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={85}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={10}
                  collapsible={false}
                  className="border border-0 border-b"
                >
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="font-semibold">Atas</span>
                  </div>
                </ResizablePanel>
                <ResizablePanel defaultSize={90} collapsible={false}>
                  <div className="p-3 pb-0">
                    <TRPCReactProvider>{props.children}</TRPCReactProvider>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
