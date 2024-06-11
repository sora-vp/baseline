"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { settings } from "@sora-vp/validators";

type FormSchema = z.infer<typeof settings.Canloog>;

export function Duration() {
  return <></>;
}
