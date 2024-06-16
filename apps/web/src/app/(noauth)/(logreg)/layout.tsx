import { redirect } from "next/navigation";

import { auth } from "@sora-vp/auth";
import settings from "@sora-vp/settings";
import { Toaster } from "@sora-vp/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

export default async function LogRegLayout(props: {
  children: React.ReactNode;
}) {
  const alreadyLoggedIn = await auth();

  if (alreadyLoggedIn) redirect("/admin");

  const { canLogin } = settings.getSettings();

  if (!canLogin)
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6 md:p-0">
        <h1 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Akses masuk ditolak.
        </h1>
      </div>
    );

  return (
    <TRPCReactProvider>
      <div className="flex h-screen w-screen items-center justify-center p-6 md:p-0">
        {props.children}
      </div>

      <Toaster richColors />
    </TRPCReactProvider>
  );
}
