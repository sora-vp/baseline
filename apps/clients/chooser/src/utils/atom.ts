import { atomWithStorage } from "jotai/utils";

export const successTimeoutAtom = atomWithStorage("successTimeout", 10_000);
