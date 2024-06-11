"use client";

import { FileJson, FileSpreadsheet, FileText, UserPlus } from "lucide-react";

import { Button } from "@sora-vp/ui/button";

import { SuddenQr } from "./sudden-qr";

export function DataTable() {
  return (
    <div className="">
      <div className="flex flex-col gap-2 lg:flex-row">
        <Button>
          Tambah Partisipan Baru
          <UserPlus className="ml-2 h-4 w-4" />
        </Button>
        <Button>
          Unggah Partisipan (File CSV)
          <FileText className="ml-2 h-4 w-4" />
        </Button>
        <SuddenQr />
        <Button>
          Ekspor JSON
          <FileJson className="ml-2 h-4 w-4" />
        </Button>
        <Button>
          Ekspor XLSX
          <FileSpreadsheet className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
