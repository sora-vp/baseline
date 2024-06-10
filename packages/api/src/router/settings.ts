import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import settings from "@sora-vp/settings";

import { protectedProcedure, publicProcedure } from "../trpc";

export const settingsRouter = {
  getSettings: publicProcedure.query(() => settings.getSettings()),

  getCanLoginStatus: protectedProcedure.query(() => {
    const { canLogin } = settings.getSettings();

    return { canLogin };
  }),

  updateCanLogin: protectedProcedure
    .input(z.object({ canLogin: z.boolean() }))
    .mutation(async ({ input }) =>
      settings.updateSettings.canLogin(input.canLogin),
    ),
} satisfies TRPCRouterRecord;
