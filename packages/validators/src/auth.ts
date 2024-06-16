import { z } from "zod";

const validNameRegex =
  /^(?![ -.&,_'":?!])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!]{2})[a-zA-Z- .,']+$/;

const email = z
  .string()
  .min(1, { message: "Bidang email harus di isi!" })
  .email({ message: "Bidang email harus berupa email yang valid!" });
const password = z
  .string()
  .min(1, { message: "Kata sandi harus di isi!" })
  .min(6, { message: "Kata sandi memiliki panjang setidaknya 6 karakter!" });
const name = z
  .string()
  .min(3, { message: "Bidang nama harus di isi!" })
  .regex(validNameRegex, {
    message: "Bidang nama harus berupa nama yang valid!",
  });

const LoginFormSchema = z.object({
  email,
  password,
});

const ServerRegisterSchema = z.object({
  email,
  password,
  name,
});

const RegisterFormSchema = ServerRegisterSchema.merge(
  z.object({
    passConfirm: z.string().min(6, {
      message: "Konfirmasi kata sandi diperlukan setidaknya 6 karakter!",
    }),
  }),
).refine((data) => data.password === data.passConfirm, {
  message: "Konfirmasi kata sandi tidak sama!",
  path: ["passConfirm"],
});

export const auth = {
  LoginFormSchema,
  RegisterFormSchema,
  ServerRegisterSchema,
} as const;
