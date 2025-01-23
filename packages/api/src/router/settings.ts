import type { TRPCRouterRecord } from "@trpc/server";

import settings from "@sora-vp/settings";
import { settings as settingsSchema } from "@sora-vp/validators";

import { adminProcedure } from "../trpc";

export const settingsRouter = {
  getSettings: adminProcedure.query(() => {
    const currentSettings = settings.getSettings();

    return currentSettings;
  }),

  getCanLoginStatus: adminProcedure.query(() => {
    const { canLogin } = settings.getSettings();

    return { canLogin };
  }),

  updateCanLogin: adminProcedure
    .input(settingsSchema.SharedCanLogin)
    .mutation(({ input }) => settings.updateSettings.canLogin(input.canLogin)),

  changeVotingBehaviour: adminProcedure
    .input(settingsSchema.SharedBehaviour)
    .mutation(({ input }) => {
      settings.updateSettings.canVote(input.canVote);
      settings.updateSettings.canAttend(input.canAttend);

      return { success: true };
    }),

  changeVotingTime: adminProcedure
    .input(settingsSchema.SharedDuration)
    .mutation(({ input }) => {
      settings.updateSettings.startTime(input.startTime);
      settings.updateSettings.endTime(input.endTime);

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
