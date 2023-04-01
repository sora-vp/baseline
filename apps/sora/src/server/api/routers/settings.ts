import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import {
  PengaturanPerilakuValidationSchema,
  ServerPengaturanWaktuValidationSchema,
} from "~/schema/admin.settings.schema";

import settings from "~/utils/settings";
import type { DataModel } from "~/utils/settings";

export const settingsRouter = createTRPCRouter({
  getSettings: publicProcedure.query(async () => {
    const data = await settings.read();

    return {
      startTime: data?.startTime ? data.startTime : null,
      endTime: data?.endTime ? data.endTime : null,
      canVote: data?.canVote !== undefined ? data.canVote : false,
      canAttend: data?.canAttend !== undefined ? data.canAttend : false,
    };
  }),

  changeVotingBehaviour: protectedProcedure
    .input(PengaturanPerilakuValidationSchema)
    .mutation(async ({ input }) => {
      const readedData = await settings.read();

      await settings.write({
        ...(readedData as unknown as DataModel),
        ...input,
      });

      return { message: "Pengaturan perilaku pemilihan berhasil diperbarui!" };
    }),

  changeVotingTime: protectedProcedure
    .input(ServerPengaturanWaktuValidationSchema)
    .mutation(async ({ input }) => {
      const readedData = await settings.read();

      await settings.write({
        ...(readedData as unknown as DataModel),
        ...input,
      });

      return { message: "Pengaturan waktu pemilihan berhasil diperbarui!" };
    }),
});
