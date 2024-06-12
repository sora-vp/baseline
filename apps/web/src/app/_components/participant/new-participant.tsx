"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse as parseCSV } from "csv-parse";
import { FileText, UserPlus } from "lucide-react";
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

type SingleFormSchema = z.infer<typeof participant.SharedAddPariticipant>;
type UploadFormSchema = { csv: FileList };

export const ReusableDialog = memo(function MemoizedReusable({
  dialogOpen,
  setOpen,
  title,
  description,
  dialogTrigger,
  children,
}: {
  dialogOpen: boolean;
  setOpen: () => void;
  title: string;
  description: string;
  dialogTrigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>

          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
});

export function SingleNewParticipant() {
  const [isOpen, setDialogOpen] = useState(false);

  const apiUtils = api.useUtils();

  const form = useForm<SingleFormSchema>({
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

  const setOpenCb = useCallback(() => setDialogOpen((prev) => !prev), []);

  return (
    <ReusableDialog
      dialogOpen={isOpen || participantMutation.isPending}
      setOpen={setOpenCb}
      title="Tambah Partisipan Baru"
      description="Masukan informasi peserta pemilihan yang baru."
      dialogTrigger={
        <Button>
          Tambah Partisipan Baru
          <UserPlus className="ml-2 h-4 w-4 lg:ml-6" />
        </Button>
      }
    >
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
                  <Input {...field} disabled={participantMutation.isPending} />
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
                  <Input {...field} disabled={participantMutation.isPending} />
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
    </ReusableDialog>
  );
}

export function UploadNewParticipant(params: type) {
  const [isOpen, setDialogOpen] = useState(false);
  const [readLock, setReadLock] = useState(false);

  const apiUtils = api.useUtils();

  const form = useForm<UploadFormSchema>({
    resolver: zodResolver(participant.UploadParticipantSchema),
  });

  const insertManyMutation = api.participant.insertManyParticipant.useMutation({
    onSuccess(result) {
      toast.success("Berhasil mengunggah file csv!", {
        description: "Seluruh peserta yang terdaftar berhasil ditambahkan!",
      });

      setDialogOpen(false);
    },

    onError(result) {
      toast.error("Gagal mengunggah file csv.", {
        description: result.message,
      });
    },

    async onSettled() {
      setReadLock(false);

      await apiUtils.participant.getAllParticipants.invalidate();
    },
  });

  async function onSubmit(values: UploadFormSchema) {
    setReadLock(true);

    const file = values.csv.item(0)!;
    const text = await file.text();

    parseCSV(text, { columns: true, trim: true }, (err, records) => {
      if (err) {
        setReadLock(false);

        toast.error("Gagal Membaca File", {
          description: `Terjadi kesalahan, Error: ${err.message}`,
        });

        return;
      }

      const result = participant.SharedUploadManyParticipant.safeParse(records);

      if (!result.success) {
        toast.error("Format file tidak sesuai!", {
          description: `Mohon periksa kembali format file yang ingin di upload, masih ada kesalahan.`,
        });

        setReadLock(false);

        return;
      }

      insertManyMutation.mutate(result.data);
    });
  }

  const setOpenCb = useCallback(() => setDialogOpen((prev) => !prev), []);

  return (
    <ReusableDialog
      dialogOpen={isOpen || insertManyMutation.isPending || readLock}
      setOpen={setOpenCb}
      title="Upload File CSV"
      description="Upload file csv untuk menambahkan banyak peserta ke daftar pemilih tetap."
      dialogTrigger={
        <Button>
          Unggah Partisipan (File CSV)
          <FileText className="ml-2 h-4 w-4 lg:ml-6" />
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="csv"
            render={() => (
              <FormItem>
                <FormLabel>File CSV</FormLabel>
                <FormControl>
                  <Input
                    accept="text/csv"
                    type="file"
                    disabled={readLock || insertManyMutation.isPending}
                    {...form.register("csv")}
                  />
                </FormControl>
                <FormDescription>
                  Pilih file csv untuk menambahkan banyak murid sekaligus.
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
                disabled={readLock || insertManyMutation.isPending}
              >
                Batal
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="md:w-fit"
              disabled={readLock || insertManyMutation.isPending}
            >
              Unggah
            </Button>
          </div>
        </form>
      </Form>
    </ReusableDialog>
  );
}
