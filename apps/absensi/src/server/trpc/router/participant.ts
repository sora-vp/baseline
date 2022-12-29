import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

import { ParticipantModel } from "@models/index";
import { TambahPesertaValidationSchema } from "@schema/admin.peserta.schema";
import { TRPCError } from "@trpc/server";

export const participantRouter = router({
  getParticipantPaginated: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().min(10),
        pageIndex: z.number().min(0),
      })
    )
    .query(async ({ input: { pageSize: limit, pageIndex: offset } }) => {
      try {
        const participants = await ParticipantModel.paginate(
          {},
          { offset, limit }
        );

        return participants;
      } catch (e: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message,
        });
      }
    }),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      const newParticipant = new ParticipantModel(input);

      await newParticipant.save();

      return { message: "Berhasil menambahkan peserta baru!" };
    }),
});
