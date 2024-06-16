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
import { participant } from "@sora-vp/validators";

import { api } from "~/trpc/react";
import { ReusableDialog } from "./new-participant";

interface IProps {
  dialogOpen: boolean;
  openSetter: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  qrId: string;
  subpart?: string;
}

type EditFormSchema = z.infer<typeof participant.SharedAddParticipant>;

export function EditParticipant(props: IProps) {
  const apiUtils = api.useUtils();

  const form = useForm<EditFormSchema>({
    resolver: zodResolver(participant.SharedAddParticipant),
    defaultValues: {
      name: props.name,
      subpart: props.subpart!,
    },
  });

  const participantEditMutation = api.participant.updateParticipant.useMutation(
    {
      onSuccess() {
        toast.success("Operasi pengubahan berhasil!", {
          description: "Berhasil mengubah pemilih tetap.",
        });

        props.openSetter(false);
      },

      onError(result) {
        toast.error("Gagal mengubah peserta, coba lagi nanti.", {
          description: result.message,
        });
      },

      async onSettled() {
        await apiUtils.participant.getAllParticipants.invalidate();
      },
    },
  );

  const currentName = useWatch({ control: form.control, name: "name" });
  const currentSubpart = useWatch({ control: form.control, name: "subpart" });

  const stillTheSameValue = useMemo(
    () => currentName === props.name && currentSubpart === props.subpart,
    [currentName, currentSubpart, props.name, props.subpart],
  );

  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen || participantEditMutation.isPending}
      setOpen={() => {
        if (!participant.isPending)
          props.openSetter((prev) => {
            const newValue = !prev;

            if (!newValue) setTimeout(() => form.reset(), 1000);

            return newValue;
          });
      }}
      title="Perbaiki Identitas"
      description="Perbarui identitas peserta yang mungkin salah dalam penulisan nama ataupun bagian dari peserta."
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
                  <FormLabel>Nama Peserta</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={participantEditMutation.isPending}
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
                      disabled={participantEditMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Pengelompokan jenis peserta (siswa, guru, panitia, dll).
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
                disabled={participantEditMutation.isPending}
              >
                Batal
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="md:w-fit"
              disabled={stillTheSameValue || participantEditMutation.isPending}
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
