import mongoose, { ClientSession } from "mongoose";

type TransactionCallback = (session: ClientSession) => Promise<void>;

export const runInTransaction = async (callback: TransactionCallback) => {
  const session: ClientSession = await mongoose.startSession();

  session.startTransaction();

  try {
    await callback(session);

    // Commit the changes
    await session.commitTransaction();
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();

    // logging the error
    console.error(error);

    // Rethrow the error
    throw error;
  } finally {
    // Ending the session
    session.endSession();
  }
};
