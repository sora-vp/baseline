import { z } from "zod";

const id = z.number().min(1).int();
const role = z.enum(["admin", "comittee"], {
  required_error: "Dimohon untuk memilih tingkatan pengguna",
});

const ServerAcceptObjectIdNumber = z.object({
  id,
});

const ServerAcceptIdAndRole = z.object({
  id,
  role,
});

const RoleFormSchema = z.object({
  role,
});

export const admin = {
  ServerAcceptObjectIdNumber,
  ServerAcceptIdAndRole,
  RoleFormSchema,
} as const;
