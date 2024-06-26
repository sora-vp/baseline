"use client";

import type { RouterOutputs } from "@sora-vp/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Space_Mono } from "next/font/google";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PencilLine,
} from "lucide-react";

import { Button } from "@sora-vp/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@sora-vp/ui/dropdown-menu";
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

import { api } from "~/trpc/react";
import { UpdateRole } from "./update-role";

type PendingUserList = RouterOutputs["admin"]["getAllRegisteredUser"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<PendingUserList>[] = [
  {
    accessorKey: "user",
    header: "Informasi Akun",
    cell: ({ row }) => (
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col">
          <p>{row.original.name ? row.original.name : "N/A"}</p>
          <small className="text-muted-foreground">
            {row.original.email ? row.original.email : "N/A"}
          </small>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Tingkatan Pengguna",
    cell: ({ row }) => (
      <p>
        {row.getValue("role") === "admin" ? "Administrator" : "Panitia Biasa"}
      </p>
    ),
  },
  {
    accessorKey: "verifiedAt",
    header: "Waktu Pengguna Terverifikasi",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("verifiedAt"), "dd MMMM yyyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openUpdate, setOpenUpdate] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const toggleOpen = useCallback(() => setOpenUpdate((prev) => !prev), []);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenUpdate(true)}
              >
                <PencilLine className="mr-2 h-4 md:w-4" />
                Perbarui Tingkatan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UpdateRole
            isOpen={openUpdate}
            toggleOpen={toggleOpen}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            currRole={user.role!}
            userId={user.id}
          />
        </>
      );
    },
  },
];

export function AllRegisteredUser() {
  const allRegisteredUserQuery =
    api.admin.getAllRegisteredUser.useQuery(undefined);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: allRegisteredUserQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
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
            {allRegisteredUserQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Error: {allRegisteredUserQuery.error.message}
                </TableCell>
              </TableRow>
            ) : null}

            {allRegisteredUserQuery.isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : null}

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
                {!allRegisteredUserQuery.isLoading && (
                  <>
                    {!allRegisteredUserQuery.isError && (
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
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
