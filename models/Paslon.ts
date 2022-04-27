import mongoose, { Schema, Types, Model } from "mongoose";

export interface IPaslon {
  _id: Types.ObjectId;
  ketua: string;
  wakil: string;
  imgName: string;
  memilih: number;
}

export interface PaslonModel extends Model<IPaslon> {
  upvote(paslon_id: Types.ObjectId): Promise<IPaslon>;
}

const PaslonSchema = new Schema<IPaslon, PaslonModel>({
  ketua: {
    required: true,
    match: /^[a-zA-Z\s\-]+$/,
    unique: true,
    type: String,
  },
  wakil: {
    required: true,
    match: /^[a-zA-Z\s\-]+$/,
    unique: true,
    type: String,
  },
  imgName: {
    type: String,
    unique: true,
    required: true,
  },
  memilih: {
    type: Number,
    required: false,
    default: 0,
  },
});
PaslonSchema.static("upvote", async function upvote(paslon_id: Types.ObjectId) {
  const paslon = await this.findByIdAndUpdate(paslon_id, {
    $inc: { memilih: 1 },
  });
  return paslon;
});

export default (mongoose.models.Paslon as PaslonModel) ||
  mongoose.model<IPaslon, PaslonModel>("Paslon", PaslonSchema);
