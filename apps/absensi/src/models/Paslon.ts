import { prop } from "@typegoose/typegoose";

const nameRegExp = /^[a-zA-Z\s\-]+$/;

export class Paslon {
  @prop({ required: true, unique: true, match: nameRegExp })
  public namaKetua!: string;

  @prop({ required: true, unique: true, match: nameRegExp })
  public namaWakil!: string;

  @prop({ required: true, unique: true })
  public imgName!: string;

  @prop({ default: 0 })
  public dipilih!: number;
}
