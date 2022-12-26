import { prop } from "@typegoose/typegoose";
import { nanoid } from "id-generator";

const nameRegExp = /^[a-zA-Z\s\-]+$/;

export class Participant {
  @prop({ required: true, unique: true, match: nameRegExp })
  public namaKetua!: string;

  @prop({ required: true })
  public keterangan!: string;

  @prop({ required: true, unique: true, default: () => nanoid() })
  public qrId!: string;

  @prop({ required: true, default: false })
  public sudahAbsen!: boolean;

  @prop({ required: true, default: false })
  public sudahMemilih!: boolean;
}
