import { z } from "zod";

const validNameRegex =
  /^(?![ -.&,_'":?!])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!]{2})[a-zA-Z- .,']+$/;

const email = z
  .string()
  .min(1, { message: "Bidang email harus di isi!" })
  .email({ message: "Bidang email harus berupa email yang valid!" });
const password = z
  .string()
  .nonempty({ message: "Kata sandi harus di isi!" })
  .min(6, { message: "Kata sandi memiliki panjang setidaknya 6 karakter!" });
const name = z
  .string()
  .min(1, { message: "Bidang nama harus di isi!" })
  .regex(validNameRegex, {
    message: "Bidang nama harus berupa nama yang valid!",
  });

export const LoginSchemaValidator = z.object({
  email,
  password,
});

export const ServerRegisterSchemaValidator = z.object({
  email,
  password,
  name,
});

export const ClientRegisterSchemaValidator =
  ServerRegisterSchemaValidator.merge(
    z.object({
      passConfirm: z.string().min(6, {
        message: "Konfirmasi kata sandi diperlukan setidaknya 6 karakter!",
      }),
    }),
  ).refine((data) => data.password === data.passConfirm, {
    message: "Konfirmasi kata sandi tidak sama!",
    path: ["passConfirm"],
  });

export const ServerChangePasswordSchemaValidator = z.object({
  lama: password,
  baru: z
    .string()
    .nonempty({ message: "Kata sandi baru harus di isi!" })
    .min(6, {
      message: "Kata sandi baru memiliki panjang setidaknya 6 karakter!",
    }),
});

export const ClientChangePasswordSchemaValidator =
  ServerChangePasswordSchemaValidator.merge(
    z.object({
      konfirmasi: z.string().min(1, {
        message: "Konfirmasi kata sandi diperlukan setidaknya 6 karakter!",
      }),
    }),
  ).refine((data) => data.baru === data.konfirmasi, {
    message: "Konfirmasi kata sandi tidak sama!",
    path: ["konfirmasi"],
  });

export const ChangeNameSchemaValidator = z.object({ name });

export type LoginType = z.infer<typeof LoginSchemaValidator>;
export type ServerRegisterType = z.infer<typeof ServerRegisterSchemaValidator>;
export type ClientRegisterType = z.infer<typeof ClientRegisterSchemaValidator>;
export type ClientChangePasswordType = z.infer<
  typeof ClientChangePasswordSchemaValidator
>;
export type ChangeNameType = z.infer<typeof ChangeNameSchemaValidator>;
