"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@sora-vp/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sora-vp/ui/dialog";
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
import { participant } from "@sora-vp/validators";

import { api } from "~/trpc/react";

type FormSchema = z.infer<typeof participant.SharedAddPariticipant>;

export function NewParticipant() {
  const [isOpen, setDialogOpen] = useState(false);

  const apiUtils = api.useUtils();

  const form = useForm<FormSchema>({
    resolver: zodResolver(participant.SharedAddPariticipant),
    defaultValues: {
      name: "",
      subpart: "",
    },
  });

  const participantMutation = api.participant.createNewParticipant.useMutation({
    onSuccess() {
      toast.success("Operasi penambahan berhasil!", {
        description: "Berhasil menambahkan pemilih tetap baru.",
      });

      form.reset();
      setDialogOpen(false);
    },

    onError(result) {
      toast.error("Gagal menambahkan peserta, coba lagi nanti.", {
        description: result.message,
      });
    },

    async onSettled() {
      await apiUtils.participant.getAllParticipants.invalidate();
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setDialogOpen((value) => {
          const newValue = !value;

          if (!newValue) form.reset();

          return newValue;
        });
      }}
    >
      <DialogTrigger asChild>
        <Button>
          Tambah Partisipan Baru
          <UserPlus className="ml-2 h-4 w-4 lg:ml-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tambah Partisipan Baru
          </DialogTitle>
          <DialogDescription>
            Masukan informasi peserta pemilihan yang baru.
          </DialogDescription>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                participantMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nama Peserta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={participantMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Nama peserta yang akan masuk menjadi daftar pemilih tetap.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subpart"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Peserta Bagian Dari</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={participantMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Pengelompokan jenis peserta (siswa, guru, panitia, dll).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse gap-2 md:flex-row">
                <DialogClose asChild>
                  <Button
                    className="md:ml-auto md:w-fit"
                    type="button"
                    variant="secondary"
                    disabled={participantMutation.isPending}
                  >
                    Batal
                  </Button>
                </DialogClose>

                <Button
                  type="submit"
                  className="md:w-fit"
                  disabled={participantMutation.isPending}
                >
                  Tambah
                </Button>
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
