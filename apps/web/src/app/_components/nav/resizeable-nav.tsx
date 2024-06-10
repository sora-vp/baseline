"use client";

import { useState } from "react";
import localFont from "next/font/local";

import { cn } from "@sora-vp/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sora-vp/ui/resizable";

import type { Props as TopNavbarProps } from "./top-navbar";
import { TopNavbar } from "./top-navbar";

interface Props {
  children: React.ReacNode;
}

const sundaneseFont = localFont({
  src: "../../fonts/NotoSansSundanese-Regular.ttf",
});

export function ResizeableNav({
  name,
  nameFallback,
  email,
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
          isCollapsed && "min-w-[45px] transition-all duration-300 ease-in-out",
        )}
      >
        {!isCollapsed ? (
          <div className="flex items-center justify-center p-6 text-4xl">
            <span className={sundaneseFont.className}>ᮞᮧᮛ</span>
          </div>
        ) : null}
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
