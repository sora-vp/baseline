"use client";

import type { RouterOutputs } from "@sora-vp/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { createContext, useContext, useEffect, useState } from "react";
import { Space_Mono } from "next/font/google";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from "lucide-react";

import { Button } from "@sora-vp/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@sora-vp/ui/dropdown-menu";
import { Input } from "@sora-vp/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sora-vp/ui/select";
import { Skeleton } from "@sora-vp/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sora-vp/ui/table";
import { toast } from "@sora-vp/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sora-vp/ui/tooltip";

import { api } from "~/trpc/react";
import { ExportJSON, ExportXLSX } from "./export";
import { SingleNewParticipant, UploadNewParticipant } from "./new-participant";
import { DeleteParticipant, EditParticipant } from "./participant-action";
import { SuddenQr } from "./sudden-qr";

type ParticipantList =
  RouterOutputs["participant"]["getAllParticipants"][number];

const GlobalSystemAllowance = createContext(true);

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

const columns: ColumnDef<ParticipantList>[] = [
  {
    id: "participantName",
    accessorKey: "name",
    header: "Nama Peserta",
  },
  {
    accessorKey: "subpart",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bagian Dari
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "qrId",
    header: "QR ID",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger
          onClick={async () => {
            await navigator.clipboard.writeText(row.getValue("qrId"));
            toast.success("Berhasil menyalin QR ID!");
          }}
        >
          <pre className={MonoFont.className}>{row.getValue("qrId")}</pre>
        </TooltipTrigger>
        <TooltipContent>
          <p>Klik untuk menyalin</p>
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    accessorKey: "alreadyAttended",
    header: "Sudah Absen?",
    cell: ({ row }) => (
      <div className="text-center">
        <Tooltip>
          <TooltipTrigger>
            <span className="text-xl">
              {row.getValue("alreadyAttended") ? "✅" : "❌"}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {row.original.attendedAt
                ? format(
                    row.original.attendedAt,
                    "EEEE, dd MMMM yyy, kk.mm.ss",
                    {
                      locale: id,
                    },
                  )
                : "Belum absen"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
  },
  {
    accessorKey: "alreadyChoosing",
    header: "Sudah Memilih?",
    cell: ({ row }) => (
      <div className="text-center">
        <Tooltip>
          <TooltipTrigger>
            <span className="text-xl">
              {row.getValue("alreadyChoosing") ? "✅" : "❌"}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {row.original.choosingAt
                ? format(
                    row.original.choosingAt,
                    "EEEE, dd MMMM yyy, kk.mm.ss",
                    {
                      locale: id,
                    },
                  )
                : "Belum memilih"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Durasi Memilih",
    cell: ({ row }) => (
      <>
        {row.getValue("alreadyAttended") && row.getValue("alreadyChoosing") ? (
          <span>
            {formatDuration(
              intervalToDuration({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                start: row.original.attendedAt!,

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                end: row.original.choosingAt!,
              }),
              { locale: id },
            )}
          </span>
        ) : (
          <div className="text-center">
            <span className="text-xl">{"❌"}</span>
          </div>
        )}
      </>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const participant = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const globallyAllowedToOpen = useContext(GlobalSystemAllowance);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (!globallyAllowedToOpen) {
          setOpenEdit(false);
          setOpenDelete(false);
        }
      }, [globallyAllowedToOpen]);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={
                  !globallyAllowedToOpen ||
                  (participant.alreadyAttended && participant.alreadyChoosing)
                }
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenEdit(true)}
              >
                <PencilLine className="mr-2 h-4 md:w-4" />
                Ubah Identitas
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
                disabled={participant.alreadyAttended}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Peserta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditParticipant
            dialogOpen={openEdit}
            openSetter={setOpenEdit}
            name={participant.name}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            qrId={participant.qrId!}
            subpart={participant.subpart}
          />
          <DeleteParticipant
            dialogOpen={openDelete}
            openSetter={setOpenDelete}
            name={participant.name}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            qrId={participant.qrId!}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const participantQuery = api.participant.getAllParticipants.useQuery(
    undefined,
    {
      refetchInterval: 2500,
      refetchOnWindowFocus: true,
    },
  );

  const settingsQuery = api.settings.getSettings.useQuery(undefined, {
    refetchInterval: 3500,
    refetchIntervalInBackground: true,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [allowedToOpenModifier, setAllowedOpen] = useState(true);

  const table = useReactTable({
    data: participantQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setAllowedOpen(!settingsQuery.data.canAttend);
    }
  }, [settingsQuery.data]);

  return (
    <GlobalSystemAllowance.Provider value={allowedToOpenModifier}>
      <div className="flex h-screen flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between lg:gap-0">
          <SingleNewParticipant />
          <UploadNewParticipant />
          <SuddenQr />
          <ExportJSON />
          <ExportXLSX />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center">
            <Input
              placeholder="Cari berdasarkan nama peserta..."
              value={
                table.getColumn("participantName")?.getFilterValue() as string
              }
              onChange={(event) =>
                table
                  .getColumn("participantName")
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-2xl"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Kolom-Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {participantQuery.isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Error: {participantQuery.error.message}
                    </TableCell>
                  </TableRow>
                ) : null}

                {participantQuery.isLoading ? (
                  <>
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={columns.length}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : null}

                <TooltipProvider>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {!participantQuery.isLoading && (
                        <>
                          {!participantQuery.isError && (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                              >
                                Tidak ada data.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </>
                  )}
                </TooltipProvider>
              </TableBody>
            </Table>
          </div>
          <div className="mb-52 flex items-center justify-end space-x-2 py-4">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Baris per halaman</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value: string) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[20, 40, 60, 80, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalSystemAllowance.Provider>
  );
}
