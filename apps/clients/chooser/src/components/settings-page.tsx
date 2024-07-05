import { successTimeoutAtom } from "@/utils/atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
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
import { toast } from "@sora-vp/ui/toast";

const formSchema = z.object({
  timeout: z.coerce.number().min(500, {
    message: "Durasi minimal adalah 500 milidetik (setengah detik).",
  }),
});

export function SettingsPage() {
  const [timeoutDuration, setDuration] = useAtom(successTimeoutAtom);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeout: timeoutDuration,
    },
  });

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex max-w-3xl flex-col gap-5">
        <div className="space-y-2">
          <h2 className="mt-10 scroll-m-20 text-center text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Halaman Pengaturan
          </h2>
          <p className="text-justify leading-7">
            Pada halaman ini, anda dapat mengatur sebarapa lama durasi tampilnya
            warna hijau ketika sukses melakukan pemilihan kandidat. Nilai durasi
            bawaan yaitu 12000 milidetik (12 detik).
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              setDuration(data.timeout);
              toast.success("Berhasil mengubah durasi waktu tampil", {
                description: `Berhasil di ubah menjadi ${data.timeout / 1000} detik`,
              });

              setTimeout(() => navigate("/"), 500);
            })}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durasi Waktu Tunggu</FormLabel>
                  <FormControl>
                    <div className="flex gap-5">
                      <Input type="number" placeholder="5000" {...field} />
                      <small className="text-center">
                        {Number.isNaN(parseInt(field.value))
                          ? "N/A"
                          : parseInt(field.value) / 1000}{" "}
                        detik
                      </small>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Tetapkan berapa lama waktu berhasil akan transisi kembali ke
                    halaman pindai QR.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-5">
              <NavLink to="/" className="w-1/2">
                {() => (
                  <Button className="w-full" variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                  </Button>
                )}
              </NavLink>
              <Button type="submit" className="w-1/2">
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
