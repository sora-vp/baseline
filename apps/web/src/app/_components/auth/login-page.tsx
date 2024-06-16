"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@sora-vp/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sora-vp/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sora-vp/ui/form";
import { Input } from "@sora-vp/ui/input";
import { toast } from "@sora-vp/ui/toast";
import { auth } from "@sora-vp/validators";

type FormSchema = z.infer<typeof auth.LoginFormSchema>;

export function LoginComponent() {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(auth.LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormSchema) {
    const loginResult = await signIn("credentials", {
      redirect: false,
      ...values,
    });

    if (loginResult?.error) {
      console.log(loginResult);
      toast.error("Gagal login", { description: "Email atau password salah!" });

      return;
    }

    toast.success("Berhasil login!");

    router.replace("/admin");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Login sebagai Administrator</CardTitle>
        <CardDescription className="text-xl font-extralight">
          Mohon masukan email dan kata sandi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="stoppinclouds@skyfaring.net"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan email yang sudah di daftarkan sebelumnya.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata sandi</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan kata sandi yang sudah di daftarkan sebelumnya.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Login
              </Button>

              {!form.formState.isSubmitting ? (
                <Link
                  className="block w-full text-center text-sm text-foreground/70 underline"
                  href="/register"
                >
                  daftarkan akun jika belum ada administrator
                </Link>
              ) : (
                <p className="block w-full text-center text-sm text-foreground/40">
                  daftarkan akun jika belum ada administrator
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
