import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import settings from "@sora-vp/settings";

import {
  // protectedProcedure,
  publicProcedure,
} from "../trpc";

export const settingsRouter = {
  getSettings: publicProcedure.query(() => settings.getSettings()),
} satisfies TRPCRouterRecord;
