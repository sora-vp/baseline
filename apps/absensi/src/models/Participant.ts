import { prop } from "@typegoose/typegoose";
import { nanoid } from "id-generator";

const nameRegExp =
  /^(?![ -.&,_'":?!])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!]{2})[a-zA-Z- .,']+$/;

export class Participant {
  @prop({ required: true, unique: true, match: nameRegExp })
  public nama!: string;

  @prop({ required: true })
  public keterangan!: string;

  @prop({ required: true, unique: true, default: () => nanoid(15) })
  public qrId!: string;

  @prop({ required: true, default: false })
  public sudahAbsen!: boolean;

  @prop({ required: true, default: false })
  public sudahMemilih!: boolean;
}
