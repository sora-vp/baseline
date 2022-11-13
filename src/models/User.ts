import { prop, ReturnModelType } from "@typegoose/typegoose";

export class User {
  @prop({ required: true, match: /^[a-zA-Z\s\-]+$/ })
  public username!: string;

  @prop({
    required: true,
    unique: true,
    match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ default: () => Date.now() })
  public createdAt!: string;

  public static async getByEmail(
    this: ReturnModelType<typeof User>,
    email: string
  ) {
    return this.findOne({ email }).exec();
  }
}
