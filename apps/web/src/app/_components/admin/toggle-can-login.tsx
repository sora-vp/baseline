"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@sora-vp/ui/form";
import { Switch } from "@sora-vp/ui/switch";
import { toast } from "@sora-vp/ui/toast";
import { settings } from "@sora-vp/validators";

import { api } from "~/trpc/react";

type FormSchema = z.infer<typeof settings.SharedCanLogin>;

export const ToggleCanLogin = () => {
  const utils = api.useUtils();
  const form = useForm<FormSchema>({
    resolver: zodResolver(settings.SharedCanLogin),
  });

  const canLoginQuery = api.settings.getCanLoginStatus.useQuery();

  useEffect(() => {
    if (canLoginQuery.data) {
      form.setValue("canLogin", canLoginQuery.data.canLogin);
    }
  }, [form.setValue, canLoginQuery.data]);

  const canLoginMutation = api.settings.updateCanLogin.useMutation({
    async onMutate(newValue) {
      await utils.settings.getCanLoginStatus.cancel();

      utils.settings.getCanLoginStatus.setData(undefined, () => newValue);
    },
    onError(err) {
      utils.settings.getCanLoginStatus.setData(undefined, { canLogin: false });
      form.setValue("canLogin", false);

      toast.error("Gagal memperbarui status login", {
        description: err.message,
      });
    },
    onSuccess() {
      toast.success("Berhasil memperbarui status login!");
    },
    async onSettled() {
      await utils.settings.getCanLoginStatus.invalidate();
    },
  });

  const onSubmit = (data: FormSchema) => canLoginMutation.mutate(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="canLogin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Masih Bisa Login
                    </FormLabel>
                    <FormDescription>
                      Ini hanya berlaku untuk pengguna yang belum login, yang
                      sudah tidak akan terpengaruh sama sekali.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={
                        canLoginQuery.isLoading || canLoginMutation.isPending
                      }
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);

                        canLoginMutation.mutate({ canLogin: val });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
