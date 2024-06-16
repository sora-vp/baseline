import { redirect } from "next/navigation";

import { auth } from "@sora-vp/auth";

export default async function RootLayout(props: { children: React.ReactNode }) {
  const isLoggedIn = await auth();

  if (!isLoggedIn) redirect("/login");

  if (isLoggedIn.user.role !== "admin") redirect("/admin/partisipan");

  return <>{props.children}</>;
}
