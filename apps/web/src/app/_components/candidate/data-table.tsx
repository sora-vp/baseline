"use client";

import type { RouterOutputs } from "@sora-vp/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@sora-vp/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sora-vp/ui/dropdown-menu";
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

import { api } from "~/trpc/react";
import { DeleteCandidate, EditCandidate } from "./candidate-action";
import { NewCandidate } from "./new-candidate";

type CandidateList = RouterOutputs["candidate"]["candidateList"][number];

export const GlobalSystemAllowance = createContext(true);

const columns: ColumnDef<CandidateList>[] = [
  {
    accessorKey: "name",
    header: "Nama Kandidat",
  },
  {
    accessorKey: "counter",
    header: "Jumlah Pemilih",
    cell: ({ row }) => (
      <span>{row.getValue("counter").toLocaleString("id-ID")} Orang</span>
    ),
  },
  {
    accessorKey: "image",
    header: "Gambar Kandidat",
    cell: ({ row }) => (
      <img
        className="w-60 rounded border"
        src={`/api/uploads/${row.getValue("image")}`}
      />
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const candidate = row.original;

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
                disabled={!globallyAllowedToOpen}
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
                onClick={() => {
                  if (candidate.counter < 1) setOpenDelete(true);
                }}
                disabled={candidate.counter > 0}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Kandidat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditCandidate
            dialogOpen={openEdit}
            openSetter={setOpenEdit}
            name={candidate.name}
            id={candidate.id}
          />
          <DeleteCandidate
            dialogOpen={openDelete}
            openSetter={setOpenDelete}
            name={candidate.name}
            id={candidate.id}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const candidateQuery = api.candidate.candidateQuery.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const settingsQuery = api.settings.getSettings.useQuery(undefined, {
    refetchInterval: 3500,
    refetchIntervalInBackground: true,
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [allowedToOpenModifier, setAllowedOpen] = useState(true);

  const table = useReactTable({
    data: candidateQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setAllowedOpen(!settingsQuery.data.canVote);
    }
  }, [settingsQuery.data]);

  return (
    <GlobalSystemAllowance.Provider value={allowedToOpenModifier}>
      <div className="flex h-screen flex-col gap-3">
        <div className="flex flex-row">
          <NewCandidate />

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
              {candidateQuery.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Error: {candidateQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {candidateQuery.isLoading && !candidateQuery.isError ? (
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

              {table.getRowModel().rows?.length ? (
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
                  {!candidateQuery.isLoading && (
                    <>
                      {!candidateQuery.isError && (
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
            </TableBody>
          </Table>
        </div>

        {/* for scrollable purpose */}
        <div className="pb-52" />
      </div>
    </GlobalSystemAllowance.Provider>
  );
}
