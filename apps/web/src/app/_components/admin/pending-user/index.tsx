"use client";

import type { RouterOutputs } from "@sora-vp/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";

import { Button } from "@sora-vp/ui/button";
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

import { api } from "~/trpc/react";
import { AcceptUser } from "./accept-user";

type PendingUserList = RouterOutputs["admin"]["getPendingUser"][number];

export const columns: ColumnDef<PendingUserList>[] = [
  {
    accessorKey: "user",
    header: "Informasi Akun",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <p>{row.original.name ? row.original.name : "N/A"}</p>
        <small className="text-muted-foreground">
          {row.original.email ? row.original.email : "N/A"}
        </small>
      </div>
    ),
  },
  {
    id: "accept",
    enableHiding: false,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const apiUtils = api.useUtils();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setOpen] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

      const acceptUserMutation = api.admin.acceptPendingUser.useMutation({
        async onSuccess() {
          toast.success("Berhasil menerima pengguna baru!", {
            description: "Pengguna berhasil di approve.",
          });

          toggleOpen();

          await apiUtils.admin.getAllRegisteredUser.invalidate();
        },
        onError(error) {
          toast.error("Operasi Gagal", {
            description: `Terjadi kesalahan, Error: ${error.message}`,
          });
        },
        async onSettled() {
          await apiUtils.admin.getPendingUser.invalidate();
        },
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const triggerAcceptCallback = useCallback(
        (data: { role: "admin" | "comittee" }) =>
          acceptUserMutation.mutate({ id: row.original.id, role: data.role }),
        [acceptUserMutation, row.original.id],
      );

      const rejectUserMutation = api.admin.rejectPendingUser.useMutation({
        onSuccess() {
          toast.success("Berhasil menolak pengguna!", {
            description: "Pengguna berhasil dihapus.",
          });
        },
        onError(error) {
          toast.error("Operasi Gagal", {
            description: `Terjadi kesalahan, Error: ${error.message}`,
          });
        },
        async onSettled() {
          await apiUtils.admin.getPendingUser.invalidate();
        },
      });

      return (
        <div className="space-x-5">
          <AcceptUser
            onSubmit={triggerAcceptCallback}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            isDisabled={
              rejectUserMutation.isPending || acceptUserMutation.isPending
            }
            isLoading={acceptUserMutation.isPending}
          />

          <Button
            variant="destructive"
            disabled={
              acceptUserMutation.isPending || rejectUserMutation.isPending
            }
            onClick={() => {
              rejectUserMutation.mutate({ id: row.original.id });
            }}
          >
            {rejectUserMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Tolak
          </Button>
        </div>
      );
    },
  },
];

export function PendingUser() {
  const pendingUserQuery = api.admin.getPendingUser.useQuery(undefined);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: pendingUserQuery.data ?? [],
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
    <div className="w-full pb-40">
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
            {pendingUserQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Error: {pendingUserQuery.error.message}
                </TableCell>
              </TableRow>
            ) : null}

            {pendingUserQuery.isLoading && !pendingUserQuery.isError ? (
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
                {!pendingUserQuery.isLoading && (
                  <>
                    {!pendingUserQuery.isError && (
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
