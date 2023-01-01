import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import { absensiAppRouter } from "absensi";
import { Context, soraAppRouter } from "sora";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const appRouter = t.router({
  sora: soraAppRouter,
  absensi: absensiAppRouter,
});

export type AppRouter = typeof appRouter;
