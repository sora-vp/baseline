import { prop } from "@typegoose/typegoose";

const nameRegExp = /^[a-zA-Z\s\-]+$/;

export class Kandidat {
  @prop({ required: true, unique: true, match: nameRegExp })
  public namaKandidat!: string;

  @prop({ required: true, unique: true })
  public imgName!: string;

  @prop({ default: 0 })
  public dipilih!: number;
}
