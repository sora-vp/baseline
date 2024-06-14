"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@sora-vp/ui/button";
import { DialogClose } from "@sora-vp/ui/dialog";
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
import { candidate } from "@sora-vp/validators";

import { ReusableDialog } from "~/app/_components/participant/new-participant";
import { api } from "~/trpc/react";
import { GlobalSystemAllowance } from "./data-table";

type FormSchema = {
  name: string;
  image: File;
};

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const splitted = reader.result!.split(",");
      resolve(splitted.at(1) as string);
    };
    reader.onerror = reject;
  });

export function NewCandidate() {
  const [isOpen, setDialogOpen] = useState(false);

  const apiUtils = api.useUtils();

  const form = useForm<FormSchema>({
    resolver: zodResolver(candidate.AddNewCandidateSchema),
    defaultValues: {
      name: "",
    },
  });

  const candidateMutation = api.candidate.createNewCandidate.useMutation({
    onSuccess() {
      toast.success("Operasi penambahan berhasil!", {
        description: "Berhasil menambahkan kandidat baru.",
      });

      setDialogOpen(false);
      form.reset();
    },

    onError(result) {
      toast.error("Gagal menambahkan kandidat, coba lagi nanti.", {
        description: result.message,
      });
    },

    async onSettled() {
      await apiUtils.candidate.candidateQuery.invalidate();
    },
  });

  const globallyAllowedToOpen = useContext(GlobalSystemAllowance);

  const setOpenCb = useCallback(() => {
    if (!candidateMutation.isPending) setDialogOpen((prev) => !prev);
  }, [candidateMutation.isPending]);

  async function onSubmit(values: FormSchema) {
    const file = values.image.item(0)!;
    const image = await toBase64(file);

    candidateMutation.mutate({
      name: values.name,
      image,
      type: file.type,
    });
  }

  useEffect(() => {
    if (!globallyAllowedToOpen) setDialogOpen(false);
  }, [globallyAllowedToOpen]);

  return (
    <ReusableDialog
      dialogOpen={!globallyAllowedToOpen ? false : isOpen}
      setOpen={setOpenCb}
      title="Tambah Kandidat Baru"
      description="Masukan informasi kandidat yang baru untuk nantinya dipilih."
      dialogTrigger={
        <Button disabled={!globallyAllowedToOpen}>
          Tambah Kandidat Baru
          <UserPlus className="ml-2 h-4 w-4 text-blue-500 dark:text-blue-600 lg:ml-6" />
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama Kandidat</FormLabel>
                <FormControl>
                  <Input {...field} disabled={candidateMutation.isPending} />
                </FormControl>
                <FormDescription>
                  Nama kandidat atau paslon. Jika kandidat adalah pasangan
                  calon, gunakan tanda hubung (-) supaya pemilih memahami dengan
                  jelas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Gambar Kandidat</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    {...form.register("image")}
                    disabled={candidateMutation.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Gambar kandidat yang akan dilihat oleh pemilih.
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
                disabled={candidateMutation.isPending}
              >
                Batal
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="md:w-fit"
              disabled={candidateMutation.isPending}
            >
              Tambah
            </Button>
          </div>
        </form>
      </Form>
    </ReusableDialog>
  );
}
