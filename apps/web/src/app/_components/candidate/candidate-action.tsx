"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@sora-vp/ui/button";
import { DialogClose, DialogDescription } from "@sora-vp/ui/dialog";
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

import type { FormSchema as EditFormSchema } from "./new-candidate";
import { ReusableDialog } from "~/app/_components/participant/new-participant";
import { api } from "~/trpc/react";
import { toBase64 } from "./new-candidate";

interface IProps {
  dialogOpen: boolean;
  openSetter: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  id: number;
}

export function EditCandidate(props: IProps) {
  const apiUtils = api.useUtils();

  const form = useForm<EditFormSchema>({
    resolver: zodResolver(candidate.UpdateCandidateSchema),
    defaultValues: {
      name: props.name,
    },
  });

  const candidateEditMutation = api.candidate.updateCandidate.useMutation({
    onSuccess() {
      toast.success("Operasi pengubahan berhasil!", {
        description: "Berhasil mengubah kanddidat.",
      });

      props.openSetter(false);
      form.reset();
    },

    onError(result) {
      toast.error("Gagal mengubah kandidat, coba lagi nanti.", {
        description: result.message,
      });
    },

    async onSettled() {
      await apiUtils.candidate.candidateQuery.invalidate();
    },
  });

  const currentName = useWatch({ control: form.control, name: "name" });
  const currentImage = useWatch({ control: form.control, name: "image" });

  const stillTheSameValue = useMemo(
    () => currentName === props.name && !currentImage,
    [currentName, props.name, currentImage],
  );

  async function onSubmit(values: EditFormSchema) {
    if (values.image.length < 1) {
      candidateEditMutation.mutate({
        id: props.id,
        name: values.name,
      });

      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const file = values.image.item(0)!;
    const image = await toBase64(file);

    candidateEditMutation.mutate({
      id: props.id,
      name: values.name,
      image,
      type: file.type,
    });
  }

  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen || candidateEditMutation.isPending}
      setOpen={() => {
        if (!candidateEditMutation.isPending)
          props.openSetter((prev) => {
            const newValue = !prev;

            if (!newValue) setTimeout(() => form.reset(), 1000);

            return newValue;
          });
      }}
      title="Perbaiki Identitas Kandidat"
      description="Perbarui identitas kandidat yang mungkin salah dalam penulisan nama ataupun gambarnya."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="mt-2 grid grid-rows-1 gap-5 text-start md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nama Kandidat</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={candidateEditMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama kandidat atau paslon. Jika kandidat adalah pasangan
                    calon, gunakan tanda hubung (-) supaya pemilih memahami
                    dengan jelas.
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
                      disabled={candidateEditMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Gambar kandidat yang akan dilihat oleh pemilih. Biarkan
                    kosong jika gambar sudah benar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 md:flex-row">
            <DialogClose asChild>
              <Button
                className="md:ml-auto md:w-fit"
                type="button"
                variant="secondary"
                disabled={candidateEditMutation.isPending}
              >
                Batal
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="md:w-fit"
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              disabled={stillTheSameValue || candidateEditMutation.isPending}
            >
              Edit
            </Button>
          </div>
        </form>
      </Form>
    </ReusableDialog>
  );
}

export function DeleteCandidate(props: IProps) {
  const apiUtils = api.useUtils();

  const [confirmationText, setConfirmText] = useState("");

  const candidateDeleteMutation = api.candidate.deleteCandidate.useMutation({
    onSuccess() {
      toast.success("Operasi penghapusan berhasil!", {
        description: "Berhasil menghapus kandidat.",
      });

      props.openSetter(false);
      setConfirmText("");
    },

    onError(result) {
      toast.error("Gagal menghapus kandidat, coba lagi nanti.", {
        description: result.message,
      });
    },

    async onSettled() {
      await apiUtils.candidate.candidateQuery.invalidate();
    },
  });

  const reallySure = useMemo(
    () => confirmationText === "saya yakin dan ingin menghapus kandidat ini",
    [confirmationText],
  );

  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen || candidateDeleteMutation.isPending}
      setOpen={() =>
        props.openSetter((prev) => {
          const newValue = !prev;

          if (!newValue) setConfirmText("");

          return newValue;
        })
      }
      title="Apakah anda yakin?"
      description={`Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan hal ini, maka akan secara permanen menghapus data kandidat bernama ${props.name}.`}
    >
      <DialogDescription>
        Sebelum menghapus, ketik{" "}
        <b>saya yakin dan ingin menghapus kandidat ini</b> pada kolom dibawah:
      </DialogDescription>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (reallySure) candidateDeleteMutation.mutate({ id: props.id });
        }}
        className="mt-3 space-y-3"
      >
        <Input
          type="text"
          autoComplete="false"
          autoCorrect="false"
          disabled={candidateDeleteMutation.isPending}
          value={confirmationText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <DialogClose asChild>
            <Button
              className="md:ml-auto md:w-fit"
              type="button"
              variant="secondary"
              disabled={candidateDeleteMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>

          <Button
            type="submit"
            className="md:w-fit"
            disabled={!reallySure || candidateDeleteMutation.isPending}
          >
            Hapus
          </Button>
        </div>
      </form>
    </ReusableDialog>
  );
}
