"use client";

import { useState } from "react";
import localFont from "next/font/local";
import { Home, LineChart, Settings, User, Users } from "lucide-react";

import { cn } from "@sora-vp/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sora-vp/ui/resizable";
import { ThemeToggle } from "@sora-vp/ui/theme";
import { TooltipProvider } from "@sora-vp/ui/tooltip";

import type { Props as TopNavbarProps } from "./top-navbar";
import { NavItems } from "./nav-items";
import { TopNavbar } from "./top-navbar";

interface Props {
  children: React.ReactNode;
  role: "admin" | "comittee";
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
}

const sundaneseFont = localFont({
  src: "../../fonts/NotoSansSundanese-Regular.ttf",
});

const participantNav = {
  title: "Partisipan",
  icon: Users,
  href: "/admin/partisipan",
};

const adminNav = [
  {
    title: "Beranda",
    icon: Home,
    href: "/admin",
  },
  {
    title: "Kandidat",
    icon: User,
    href: "/admin/kandidat",
  },
  participantNav,
  {
    title: "Statistik",
    icon: LineChart,
    href: "/admin/statistik",
  },
  {
    title: "Pengaturan",
    icon: Settings,
    href: "/admin/pengaturan",
  },
];

export function ResizeableNav({
  name,
  nameFallback,
  defaultLayout = [20, 80],
  defaultCollapsed = false,
  email,
  role,
  children,
}: Props & TopNavbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-screen"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes,
        )}`;
      }}
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        minSize={15}
        maxSize={20}
        collapsible={true}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            true,
          )}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            false,
          )}`;
        }}
        className={cn(
          isCollapsed && "min-w-[55px] transition-all duration-300 ease-in-out",
        )}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-center p-6 text-4xl">
            <span className={sundaneseFont.className}>ᮞᮧᮛ</span>
          </div>
        ) : null}

        <TooltipProvider>
          <NavItems
            isCollapsed={isCollapsed}
            links={role === "admin" ? adminNav : [participantNav]}
          />
        </TooltipProvider>
        <div className={cn("flex justify-center", !isCollapsed && "mt-10")}>
          <ThemeToggle />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={defaultLayout[1]}>
        <div className="h-16 border-b">
          <div className="flex h-full items-center justify-center p-6">
            {isCollapsed ? (
              <div className="text-3xl">
                <span className={sundaneseFont.className}>ᮞᮧᮛ</span>
              </div>
            ) : null}

            <TopNavbar name={name} email={email} nameFallback={nameFallback} />
          </div>
        </div>

        <div className="overflow-y-auto p-6">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
