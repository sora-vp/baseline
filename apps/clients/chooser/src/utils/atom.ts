import { atomWithStorage } from "jotai/utils";

/**
 *  Atom yang digunakan untuk menentukan lama waktu tampil notifikasi berhasil
 *  setelah partisipan memilih kandidat dan berhasil di proses oleh server.
 */
export const successTimeoutAtom = atomWithStorage("successTimeout", 12_000);
