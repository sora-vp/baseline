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
  children: React.ReacNode;
  role: "admin" | "comittee";
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
  email,
  role,
  children,
}: Props & TopNavbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-screen"
    >
      <ResizablePanel
        defaultSize={17}
        minSize={15}
        maxSize={20}
        collapsible={true}
        onCollapse={() => {
          setIsCollapsed(true);
        }}
        onExpand={() => setIsCollapsed(false)}
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
      <ResizablePanel defaultSize={85}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel
            defaultSize={10}
            collapsible={false}
            className="border-0 border-b"
          >
            <div className="flex h-full items-center justify-center p-6">
              {isCollapsed ? (
                <div className="text-3xl">
                  <span className={sundaneseFont.className}>ᮞᮧᮛ</span>
                </div>
              ) : null}

              <TopNavbar
                name={name}
                email={email}
                nameFallback={nameFallback}
              />
            </div>
          </ResizablePanel>
          <ResizablePanel defaultSize={90} collapsible={false}>
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
