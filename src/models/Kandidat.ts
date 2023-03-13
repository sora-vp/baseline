import { prop } from "@typegoose/typegoose";

export class Kandidat {
  @prop({ required: true, unique: true })
  public namaKandidat!: string;

  @prop({ required: true, unique: true })
  public imgName!: string;

  @prop({ default: 0 })
  public dipilih!: number;
}
