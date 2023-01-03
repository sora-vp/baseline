export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/((?!login|register|api|_next/static|favicon.ico).*)"],
};
