import { redirect } from "next/navigation";

import { auth } from "@sora-vp/auth";

export default async function LogRegLayout(props: {
  children: React.ReactNode;
}) {
  const alreadyLoggedIn = await auth();

  if (alreadyLoggedIn) redirect("/admin");

  return <>{props.children}</>;
}
