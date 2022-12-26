import { router, publicProcedure, protectedProcedure } from "../trpc";

import { ParticipantModel } from "@models/index";

export const participantRouter = router({
  allParticipants: protectedProcedure.query(
    async () => await ParticipantModel.find({}).lean()
  ),
});
