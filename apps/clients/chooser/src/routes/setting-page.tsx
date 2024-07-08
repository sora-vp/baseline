import {
  defaultWSPortAtom,
  enableWSConnectionAtom,
  successTimeoutAtom,
} from "@/utils/atom";
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
import { Switch } from "@sora-vp/ui/switch";
import { toast } from "@sora-vp/ui/toast";

const formSchema = z.object({
  timeout: z.coerce.number().min(500, {
    message: "Durasi minimal adalah 500 milidetik (setengah detik).",
  }),
  wsEnabled: z.boolean(),
  wsPort: z.coerce.number().min(1000, {
    message: "Minimal berjalan di port 100.",
  }),
});

export function SettingsPage() {
  const [timeoutDuration, setDuration] = useAtom(successTimeoutAtom);
  const [wsEnabled, setWsEnabled] = useAtom(enableWSConnectionAtom);
  const [wsPort, setWsPort] = useAtom(defaultWSPortAtom);

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeout: timeoutDuration,
      wsEnabled,
      wsPort,
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
            Pada halaman ini, anda dapat mengatur durasi waktu tunggu berhasil
            dan juga pengaturan modul tombol. Secara bawaan, waktu tunggu
            berhasil itu selama 12.000 milidetik (12 detik).
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              setDuration(data.timeout);
              setWsEnabled(data.wsEnabled);
              setWsPort(data.wsPort);

              toast.success("Berhasil memperbarui pengaturan!", {
                description: "Pengaturan berhasil diubah.",
              });

              setTimeout(() => navigate("/"), 500);
            })}
            className="space-y-5"
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
                        {Number.isNaN(field.value) ? "N/A" : field.value / 1000}{" "}
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

            <FormField
              control={form.control}
              name="wsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Menggunakan Modul Tombol
                    </FormLabel>
                    <FormDescription>
                      Jika anda menggunakan modul tombol, maka anda harus
                      mengaktifkan opsi ini,{" "}
                      <a
                        href="https://github.com/sora-vp/button-module/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        pelajari lebih lanjut
                      </a>
                      .
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wsPort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Port Modul Tombol</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Di nomor port berapa server modul tombol berjalan, nomor
                    bawaan berada di port 3000.
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
