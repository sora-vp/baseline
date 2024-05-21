"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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

import { api } from "~/trpc/react";

type FormSchema = z.infer<typeof auth.RegisterFormSchema>;

export function RegistrationComponent() {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(auth.RegisterFormSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passConfirm: "",
    },
  });

  const registerUser = api.auth.register.useMutation({
    onSuccess(data) {
      if (data.success) {
        toast("Operasi berhasil!", {
          description:
            "Berhasil mendaftarkan akun baru! Silahkan login terlebih dahulu.",
        });

        form.reset();

        router.replace("/login");
      }
    },
    onError(error) {
      toast.error("Gagal mendaftarkan administrator", {
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Daftarkan Administrator</CardTitle>
        <CardDescription className="text-xl font-extralight">
          Mohon isi informasi akun administrator yang baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((val) =>
              registerUser.mutate({
                email: val.email,
                password: val.password,
                name: val.name,
              }),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="stoppinclouds@loufu.net"
                      disabled={registerUser.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Email akun administrator.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={registerUser.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama lengkap administrator yang baru.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 md:flex-row md:gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata sandi</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="*******"
                        disabled={registerUser.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan kata sandi yang aman.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi kata sandi</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="*******"
                        disabled={registerUser.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukan kata sandi yang sama.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                type="submit"
                disabled={registerUser.isPending}
              >
                Daftarkan
              </Button>

              {!registerUser.isPending ? (
                <Link
                  className="block w-full text-center text-sm text-foreground/70 underline"
                  href="/login"
                >
                  sudah memiliki akun? login
                </Link>
              ) : (
                <p className="block w-full text-center text-sm text-foreground/40">
                  sudah memiliki akun? login
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
