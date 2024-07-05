import { House } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "./button";
import { Separator } from "./separator";

export function ClientNotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-5">
        <h1 className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight lg:text-5xl">
          404
        </h1>
        <Separator orientation="vertical" className="h-14 bg-slate-500" />
        <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
          Halaman tidak ditemukan.
        </h3>
      </div>

      <NavLink to="/">
        {() => (
          <Button>
            <House className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        )}
      </NavLink>
    </div>
  );
}
