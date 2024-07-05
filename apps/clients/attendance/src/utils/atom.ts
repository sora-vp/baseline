import { atomWithStorage } from "jotai/utils";

/**
 *  Atom yang digunakan untuk menentukan lama waktu tampil notifikasi berhasil
 *  setelah partisipan menunjukan gambar QR dan terbaca oleh server.
 */
export const successTimeoutAtom = atomWithStorage("successTimeout", 5_000);
