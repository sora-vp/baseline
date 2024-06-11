"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay } from "date-fns";
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
import { Input } from "@sora-vp/ui/input";
import { Skeleton } from "@sora-vp/ui/skeleton";
import { toast } from "@sora-vp/ui/toast";
import { settings } from "@sora-vp/validators";

import { api } from "~/trpc/react";

type FormSchema = z.infer<typeof settings.SharedDuration>;

export function Duration() {
  const apiUtils = api.useUtils();

  const settingsQuery = api.settings.getSettings.useQuery();

  const form = useForm<FormSchema>({
    resolver: zodResolver(settings.SharedDuration),
  });

  const changeDuration = api.settings.changeVotingTime.useMutation({
    async onMutate() {
      await apiUtils.settings.getSettings.cancel();
    },
    onSuccess() {
      toast.success("Pengaturan durasi pemilihan berhasil diperbarui!");
    },
    onError() {
      toast.error(
        "Gagal memperbarui pengaturan durasi, mohon coba lagi nanti.",
      );
    },
    async onSettled() {
      await apiUtils.settings.getSettings.invalidate();
    },
  });

  useEffect(() => {
    if (settingsQuery.data && !changeDuration.isPending) {
      form.setValue("startTime", settingsQuery.data.startTime);
      form.setValue("endTime", settingsQuery.data.endTime);
    }
  }, [settingsQuery.data, changeDuration.isPending]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => changeDuration.mutate(data))}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Waktu Mulai</FormLabel>
              <FormControl>
                {settingsQuery.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    className="w-full"
                    type="datetime-local"
                    min={format(startOfDay(new Date()), "yyyy-MM-dd'T'HH:mm")}
                    value={
                      field.value
                        ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                        : ""
                    }
                    onChange={(e) =>
                      e.target.value === ""
                        ? field.onChange(undefined)
                        : field.onChange(new Date(e.target.value))
                    }
                    disabled={changeDuration.isPending}
                  />
                )}
              </FormControl>
              <FormDescription>
                Tentukan waktu kapan bisa memulai pemilihan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Waktu Selesai</FormLabel>
              <FormControl>
                {settingsQuery.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    type="datetime-local"
                    min={
                      form.getValues("startedAt")
                        ? format(
                            form.getValues("startedAt"),
                            "yyyy-MM-dd'T'HH:mm",
                          )
                        : ""
                    }
                    value={
                      field.value
                        ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                        : ""
                    }
                    onChange={(e) =>
                      e.target.value === ""
                        ? field.onChange(undefined)
                        : field.onChange(new Date(e.target.value))
                    }
                    disabled={changeDuration.isPending}
                  />
                )}
              </FormControl>
              <FormDescription>
                Tentukan kapan batas waktu maksimal peserta dapat melakukan
                pemilihan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={settingsQuery.isLoading || changeDuration.isPending}
        >
          Simpan
        </Button>
      </form>
    </Form>
  );
}
