"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, UserPlus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

  const participantMutation = api.participant.updateParticipant.useMutation({
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
  });

  const currentName = useWatch({ control: form.control, name: "name" });
  const currentSubpart = useWatch({ control: form.control, name: "subpart" });

  const stillTheSameValue = useMemo(
    () => currentName === props.name && currentSubpart === props.subpart,
    [currentName, currentSubpart, props.name, props.subpart],
  );

  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen || participantMutation.isPending}
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
            participantMutation.mutate({ ...data, qrId: props.qrId }),
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
          </div>

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
              disabled={stillTheSameValue || participantMutation.isPending}
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
  return (
    <ReusableDialog
      dialogOpen={props.dialogOpen}
      setOpen={() => props.openSetter((prev) => !prev)}
      title="Apakah anda yakin?"
      description={`Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan hal ini, maka akan secara permanen menghapus data peserta bernama ${props.name}.`}
    ></ReusableDialog>
  );
}
