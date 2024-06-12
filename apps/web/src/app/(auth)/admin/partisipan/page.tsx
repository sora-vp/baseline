import { DataTable } from "~/app/_components/participant/data-table";

export default function ParticipantPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight">Partisipan</h2>
        <p className="text-muted-foreground">
          Kelola partisipan yang tercantum sebagai daftar pemilih tetap.
        </p>
      </div>

      <DataTable />
    </div>
  );
}
