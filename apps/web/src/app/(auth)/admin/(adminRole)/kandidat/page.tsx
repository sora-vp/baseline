import { DataTable } from "~/app/_components/candidate/data-table";

export default function CandidatePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight">Kandidat</h2>
        <p className="text-muted-foreground">
          Kelola siapa saja yang menjadi kandidat untuk dipilih pada halaman
          ini.
        </p>
      </div>

      <DataTable />
    </div>
  );
}
