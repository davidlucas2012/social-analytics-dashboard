"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { usePosts, PostRow } from "@/features/posts/usePosts";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
      </TableCell>
    </TableRow>
  );
}

export default function PostsTable() {
  const { data: posts, isLoading, error } = usePosts();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<PostRow>[]>(
    () => [
      {
        accessorKey: "platform",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Platform
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="capitalize">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "caption",
        header: "Caption",
        cell: ({ getValue }) => (
          <span className="block max-w-[420px] truncate">
            {(getValue() as string | null) ?? "(no caption)"}
          </span>
        ),
      },
      {
        accessorKey: "posted_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Posted
          </Button>
        ),
        cell: ({ getValue }) => {
          const iso = String(getValue());
          const d = new Date(iso);
          return (
            <span className="whitespace-nowrap">
              {Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString()}
            </span>
          );
        },
      },
      {
        accessorKey: "likes",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Likes
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "comments",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Comments
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: posts ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!q) return true;
      const caption = (row.original.caption ?? "").toLowerCase();
      const platform = row.original.platform.toLowerCase();
      return caption.includes(q) || platform.includes(q);
    },
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Sort columns and filter by platform/caption.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter posts…"
          />
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-red-600">
                  Failed to load posts: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-sm text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
