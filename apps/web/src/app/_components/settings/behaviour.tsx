"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@sora-vp/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sora-vp/ui/form";
import { Switch } from "@sora-vp/ui/switch";
import { toast } from "@sora-vp/ui/toast";
import { settings } from "@sora-vp/validators";

import { api } from "~/trpc/react";

type FormSchema = z.infer<typeof settings.SharedBehaviour>;

export function Behaviour() {
  const apiUtils = api.useUtils();

  const settingsQuery = api.settings.getSettings.useQuery();

  const form = useForm<FormSchema>({
    resolver: zodResolver(settings.SharedBehaviour),
    defaultValues: {
      canVote: false,
      canAttend: false,
    },
  });

  const changeBehaviour = api.settings.changeVotingBehaviour.useMutation({
    async onMutate() {
      await apiUtils.settings.getSettings.cancel();
    },
    onSuccess() {
      toast.success("Pengaturan perilaku pemilihan berhasil diperbarui!");
    },
    onError() {
      toast.error(
        "Gagal memperbarui pengaturan perilaku, mohon coba lagi nanti.",
      );
    },
    async onSettled() {
      await apiUtils.settings.getSettings.invalidate();
    },
  });

  useEffect(() => {
    if (settingsQuery.data && !changeBehaviour.isPending) {
      form.setValue("canVote", settingsQuery.data.canVote);
      form.setValue("canAttend", settingsQuery.data.canAttend);
    }
  }, [settingsQuery.data, changeBehaviour.isPending]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => changeBehaviour.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="canVote"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sudah Bisa Memilih</FormLabel>
                <FormDescription>
                  Mengatur apakah sudah bisa memilih atau belum.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={
                    settingsQuery.isLoading || changeBehaviour.isPending
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canAttend"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sudah Bisa Absen</FormLabel>
                <FormDescription>
                  Mengatur apakah sudah bisa absen atau belum.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={
                    settingsQuery.isLoading || changeBehaviour.isPending
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={settingsQuery.isLoading || changeBehaviour.isPending}
        >
          Simpan
        </Button>
      </form>
    </Form>
  );
}
