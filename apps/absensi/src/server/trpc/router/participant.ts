import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

import { ParticipantModel } from "@models/index";
import { TambahPesertaValidationSchema } from "@schema/admin.peserta.schema";

export const participantRouter = router({
  getParticipantPaginated: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().min(10),
        pageIndex: z.number().min(0),
      })
    )
    .query(async ({ input: { pageSize: limit, pageIndex: offset } }) => {
      const participants = await ParticipantModel.find()
        .skip(offset)
        .limit(limit);
      const participantsCollectionCount = await ParticipantModel.count();

      const totalPages = Math.ceil(participantsCollectionCount / limit);
      const currentPage = Math.ceil(participantsCollectionCount % (offset + 1));

      console.log({
        offset,
        limit,
        total: participantsCollectionCount,
        page: currentPage,
        pages: totalPages,
      });

      return {
        data: participants,
        paging: {
          total: participantsCollectionCount,
          page: currentPage,
          pages: totalPages,
        },
      };
    }),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      const newParticipant = new ParticipantModel(input);

      await newParticipant.save();

      return { message: "Berhasil menambahkan peserta baru!" };
    }),
});
