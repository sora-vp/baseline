import { router, publicProcedure, protectedProcedure } from "../trpc";

import { PengaturanPerilakuValidationSchema } from "@schema/admin.settings.schema";

import settings from "@utils/settings";
import type { DataModel } from "@utils/settings";

export const settingsRouter = router({
  getSettings: publicProcedure.query(async () => {
    const data = await settings.read();

    return {
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
});
