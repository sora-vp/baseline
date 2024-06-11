import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { auth } from "@sora-vp/auth";
import { cn } from "@sora-vp/ui";
import { ThemeProvider, ThemeToggle } from "@sora-vp/ui/theme";
import { Toaster } from "@sora-vp/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { ResizeableNav } from "~/app/_components/nav/resizeable-nav";

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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const isLoggedIn = await auth();

  if (!isLoggedIn) redirect("/login");

  if (!isLoggedIn.user.verifiedAt)
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
            <div className="flex h-screen flex-col items-center justify-center p-2">
              <h2 className="scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight first:mt-0">
                Anda Belum Terverifikasi
              </h2>
              <p className="text-center font-light leading-7 sm:w-[95%] md:w-[50%] [&:not(:first-child)]:mt-6">
                Anda belum terverifikasi oleh sistem, mohon konfirmasi ke
                panitia yang lain supaya anda bisa mengakses dashboard admin.
                Jika sudah maka refresh halaman ini atau keluar dan login
                kembali.
              </p>
            </div>

            <div className="absolute bottom-4 right-4">
              <ThemeToggle />
            </div>
          </ThemeProvider>
        </body>
      </html>
    );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen overflow-y-hidden bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ResizeableNav
            name={isLoggedIn.user.name ?? ""}
            email={isLoggedIn.user.email ?? ""}
            nameFallback={isLoggedIn.user.name?.slice(0, 2) ?? ""}
            role={isLoggedIn.user.role}
          >
            <div className="overflow-y-auto p-6">
              <TRPCReactProvider>{props.children}</TRPCReactProvider>
            </div>
          </ResizeableNav>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
