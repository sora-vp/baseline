import { AllRegisteredUser } from "~/app/_components/admin/all-registered-user/index";
import { PendingUser } from "~/app/_components/admin/pending-user/index";
import { ToggleCanLogin } from "~/app/_components/admin/toggle-can-login";

export default function AdminPage() {
  return (
    <div className="flex h-screen flex-col gap-7 p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Beranda Admin</h2>
        <p className="text-muted-foreground">
          Kelola semua pengguna dan perilaku pengguna pada halaman ini.
        </p>
      </div>

      <ToggleCanLogin />

      <div className="flex flex-col gap-3">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Seluruh Pengguna
        </h4>

        <AllRegisteredUser />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Menunggu Persetujuan
        </h4>

        <PendingUser />
      </div>
    </div>
  );
}
