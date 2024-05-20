import localFont from "next/font/local";

import { cn } from "@sora-vp/ui";
import { Button } from "@sora-vp/ui/button";

const sundaneseFont = localFont({
  src: "../fonts/NotoSansSundanese-Regular.ttf",
});

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <h1
        className={cn(
          "scroll-m-20 text-5xl tracking-tight lg:text-5xl",
          sundaneseFont.className,
        )}
      >
        ᮞᮧᮛ
      </h1>
      <h3 className="scroll-m-20 text-center text-2xl font-extralight tracking-tight">
        Sebuah aplikasi pemilihan yang membantu proses demokrasi.
      </h3>
    </div>
  );
}
