import { redirect } from "next/navigation";

import { auth } from "@sora-vp/auth";
import { Toaster } from "@sora-vp/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

export default async function LogRegLayout(props: {
  children: React.ReactNode;
}) {
  const alreadyLoggedIn = await auth();

  if (alreadyLoggedIn) redirect("/admin");

  return (
    <TRPCReactProvider>
      <div className="flex h-screen w-screen items-center justify-center p-6 md:p-0">
        {props.children}
      </div>

      <Toaster richColors />
    </TRPCReactProvider>
  );
}
