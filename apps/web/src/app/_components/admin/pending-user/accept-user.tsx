"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sora-vp/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sora-vp/ui/select";

const FormSchema = z.object({
  role: z.enum(["comittee", "admin"], {
    required_error: "Dimohon untuk memilih tingkatan pengguna",
  }),
});

export const AcceptUser = ({
  isOpen,
  toggleOpen,
  isDisabled,
  isLoading,
  onSubmit,
}: {
  isOpen: boolean;
  toggleOpen: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!isLoading) toggleOpen();
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={isDisabled}>Terima</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Anda akan mengizinkan pengguna untuk mengakses platform enpitsu ini,
            mohon berkomunikasi dengan orang yang bersangkutan. Jika benar maka
            pilih tingkatan pengguna tersebut pada pilihan di bawah lalu{" "}
            <b>Izinkan</b>.
          </DialogDescription>
          <DialogDescription className="text-start">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkatan Pengguna</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkatan pengguna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="comittee">
                            Panitia Biasa
                          </SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isDisabled}>
              Batal
            </Button>
          </DialogClose>
          <Button disabled={isDisabled} onClick={form.handleSubmit(onSubmit)}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Izinkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
