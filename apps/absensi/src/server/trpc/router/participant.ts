import { router, protectedProcedure } from "../trpc";

import { ParticipantModel } from "@models/index";
import { TambahPesertaValidationSchema } from "@schema/admin.peserta.schema";

export const participantRouter = router({
  allParticipants: protectedProcedure.query(
    async () => await ParticipantModel.find({}).lean()
  ),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      const newParticipant = new ParticipantModel(input);

      await newParticipant.save();

      return { message: "Berhasil menambahkan peserta baru!" };
    }),
});
