import { prop } from "@typegoose/typegoose";

/**
 * Model for master database
 * @link https://github.com/typegoose/typegoose/issues/419
 */
export class Kandidat {
  @prop({ required: true, unique: true })
  public namaKandidat!: string;

  @prop({ required: true, unique: true })
  public imgName!: string;

  @prop({ default: 0 })
  public dipilih!: number;

  /**
   * Backup purpose
   */
  @prop({ default: () => new Date() })
  public last_voted_at!: Date;
}
