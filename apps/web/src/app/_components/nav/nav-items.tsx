import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@sora-vp/ui";
import { buttonVariants } from "@sora-vp/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sora-vp/ui/tooltip";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    icon: LucideIcon;
    href: string;
  }[];
}

export function NavItems({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-4"
    >
      <nav className="grid gap-3 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    // link.variant === "default" &&
                    //   "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  )}
                >
                  <link.icon className="h-6 w-6" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                // link.variant === "default" &&
                //   "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start text-lg font-light",
              )}
            >
              <link.icon className="mr-3 h-6 w-6" />
              {link.title}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
