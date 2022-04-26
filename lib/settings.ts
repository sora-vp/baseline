import path from "path";
import { Model, Store } from "fs-json-store";
import { EncryptionAdapter } from "fs-json-store-encryption-adapter";

export type TModelApiResponse = {
  startTime: Date | null;
  endTime: Date | null;
  canVote: boolean | null;
  reloadAfterVote: boolean | null;
};
export interface DataModel extends Partial<Model.StoreEntity> {
  startTime: Date;
  endTime: Date;
  canVote: boolean;
  reloadAfterVote: boolean;
}

const file = path.join(path.resolve(), "settings.bin");
const password = process.env.SETTINGS_PASSWORD;

if (!password)
  throw new Error("Diperlukan password untuk enkripsi data pengaturan");

const store = new Store<DataModel>({
  file,
  adapter: new EncryptionAdapter({
    password,
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
