import { atomWithStorage } from "jotai/utils";

/**
 *  Atom yang digunakan untuk menentukan lama waktu tampil notifikasi berhasil
 *  setelah partisipan memilih kandidat dan berhasil di proses oleh server.
 */
export const successTimeoutAtom = atomWithStorage("successTimeout", 12_000);

/**
 * Dua atom di bawah ini adalah atom yang akan mengatur apakah perangkat
 * ini terdapat modul tombol yang memerlukan koneksi websocket supaya
 * modul tombol dapat mengirimkan perintah dari sw2s.
 */

export const enableWSConnectionAtom = atomWithStorage(
  "enableWSConnection",
  false,
);

export const defaultWSPortAtom = atomWithStorage("defaultWSPort", 3000);
