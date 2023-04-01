import path from "path";
import { type Model, Store } from "fs-json-store";
import { EncryptionAdapter } from "fs-json-store-encryption-adapter";

import { env } from "~/env.mjs";

export type TModelApiResponse = {
  startTime: Date | null;
  endTime: Date | null;
  canVote: boolean | null;
  canAttend: boolean | null;
};
export interface DataModel extends Partial<Model.StoreEntity> {
  startTime: Date;
  endTime: Date;
  canVote: boolean;
  canAttend: boolean;
}

const file = path.join(path.resolve(), "settings.bin");

const store = new Store<DataModel>({
  file,
  adapter: new EncryptionAdapter({
    password: env.SETTINGS_SECRET,
    preset: {
      keyDerivation: {
        type: "sodium.crypto_pwhash",
        preset: "mode:interactive|algorithm:default",
      },
      encryption: {
        type: "sodium.crypto_secretbox_easy",
        preset: "algorithm:default",
      },
    },
  }),
});

export default store;
