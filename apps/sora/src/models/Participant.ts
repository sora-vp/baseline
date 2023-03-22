import { nanoid } from "id-generator";
import { prop, plugin } from "@typegoose/typegoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { FilterQuery, PaginateOptions, PaginateResult } from "mongoose";

type PaginateMethod<T> = (
  query?: FilterQuery<T>,
  options?: PaginateOptions,
  callback?: (err: any, result: PaginateResult<T>) => void
) => Promise<PaginateResult<T>>;

@plugin(mongoosePaginate)
export class Participant {
  @prop({ required: true, unique: true })
  public nama!: string;

  @prop({ required: true, unique: true, default: () => nanoid(15) })
  public qrId!: string;

  @prop({ required: true, default: false })
  public sudahAbsen!: boolean;

  @prop({ required: true, default: false })
  public sudahMemilih!: boolean;

  static paginate: PaginateMethod<Participant>;
}
