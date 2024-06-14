"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, UserPlus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

import { ReusableDialog } from "~/app/_components/participant/new-participant";
import { api } from "~/trpc/react";
import { toBase64 } from "./new-candidate";

interface IProps {
  dialogOpen: boolean;
  openSetter: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  id: string;
}

type EditFormSchema = z.infer<typeof candidate>;

export function EditCandidate(props: IProps) {
  const apiUtils = api.useUtils();

  const form = useForm<EditFormSchema>({
    // resolver: zodResolver(candidate),
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

  const stillTheSameValue = useMemo(
    () => currentName === props.name,
    [currentName, props.name],
  );

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
        <form
          onSubmit={form.handleSubmit((data) =>
            participantEditMutation.mutate({ ...data, qrId: props.qrId }),
          )}
          className="space-y-5"
        >
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
                    Gambar kandidat yang akan dilihat oleh pemilih.
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

export function DeleteParticipant(props: IProps) {
  const apiUtils = api.useUtils();

  const participantDeleteMutation =
    api.participant.deleteParticipant.useMutation({
      onSuccess() {
        toast.success("Operasi penghapusan berhasil!", {
          description: "Berhasil menghapus pemilih tetap.",
        });

        props.openSetter(false);
      },

      onError(result) {
        toast.error("Gagal menghapus peserta, coba lagi nanti.", {
          description: result.message,
        });
      },

      async onSettled() {
        await apiUtils.participant.getAllParticipants.invalidate();
      },
    });

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus peserta ini",
    [confirmationText],
  );

  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen || participantDeleteMutation.isPending}
      setOpen={() => props.openSetter((prev) => !prev)}
      title="Apakah anda yakin?"
      description={`Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan hal ini, maka akan secara permanen menghapus data peserta bernama ${props.name}.`}
    >
      <DialogDescription>
        Sebelum menghapus, ketik <b>saya ingin menghapus peserta ini</b> pada
        kolom dibawah:
      </DialogDescription>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (reallySure)
            participantDeleteMutation.mutate({ qrId: props.qrId });
        }}
        className="mt-3 space-y-3"
      >
        <Input
          type="text"
          autoComplete="false"
          autoCorrect="false"
          disabled={participantDeleteMutation.isPending}
          value={confirmationText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        <div className="flex flex-col-reverse gap-2 md:flex-row">
          <DialogClose asChild>
            <Button
              className="md:ml-auto md:w-fit"
              type="button"
              variant="secondary"
              disabled={participantDeleteMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>

          <Button
            type="submit"
            className="md:w-fit"
            disabled={!reallySure || participantDeleteMutation.isPending}
          >
            Hapus
          </Button>
        </div>
      </form>
    </ReusableDialog>
  );
}
