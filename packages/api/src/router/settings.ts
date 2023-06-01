// import settings, { type DataModel } from "~/utils/settings";
import {
  PengaturanPerilakuValidationSchema,
  ServerPengaturanWaktuValidationSchema,
} from "@sora/schema-config/admin.settings.schema";
import settings from "@sora/settings";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
  getSettings: publicProcedure.query(() => settings.getSettings()),

  changeVotingBehaviour: protectedProcedure
    .input(PengaturanPerilakuValidationSchema)
    .mutation(({ input }) => {
      settings.updateSettings.canVote(input.canVote);
      settings.updateSettings.canAttend(input.canAttend);

      return { message: "Pengaturan perilaku pemilihan berhasil diperbarui!" };
    }),

  changeVotingTime: protectedProcedure
    .input(ServerPengaturanWaktuValidationSchema)
    .mutation(({ input }) => {
      settings.updateSettings.startTime(input.startTime);
      settings.updateSettings.endTime(input.endTime);

      return { message: "Pengaturan waktu pemilihan berhasil diperbarui!" };
    }),
});
