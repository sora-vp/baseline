import { customAlphabet } from "nanoid";

const customToken = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const arrayValidator = customToken.split("");

export const nanoid = customAlphabet(customToken, 15);
export const randomFileName = customAlphabet("1234567890abcdef", 10);

export const validateId = (id: string) =>
  id
    .split("")
    .map((char) => arrayValidator.includes(char))

    // Every item is true
    .every((item) => item);
