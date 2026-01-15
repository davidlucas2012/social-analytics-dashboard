"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDashboardUIStore } from "@/features/dashboard/useDashboardUIStore";
import { Skeleton } from "@/components/ui/skeleton";

type PostWithComputed = PostRow & {
  engagementTotal: number;
  engagementRate: number | null;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const numericSort =
  (fn: (row: PostWithComputed) => number) =>
  (a: { original: PostWithComputed }, b: { original: PostWithComputed }) =>
    fn(a.original) - fn(b.original);

export default function PostsTable() {
  const { data: posts, isLoading, error } = usePosts();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PostWithComputed | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const { postsSearch, setPostsSearch, selectedPlatform, setSelectedPlatform } =
    useDashboardUIStore();

  const handleGlobalFilterChange = (value: Updater<string>) => {
    const next = typeof value === "function" ? value(postsSearch) : value;
    setPostsSearch(next);
  };

  const computed = useMemo<PostWithComputed[]>(() => {
    return (posts ?? []).map((p) => ({
      ...p,
      engagementRate: (p.engagement_rate as number | null) ?? null,
      engagementTotal:
        (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0),
    }));
  }, [posts]);

  const filtered = useMemo(() => {
    if (selectedPlatform === "all") return computed;
    return computed.filter((p) => p.platform === selectedPlatform);
  }, [computed, selectedPlatform]);

  const columns = useMemo<ColumnDef<PostWithComputed>[]>(
    () => [
      {
        accessorKey: "thumbnail_url",
        header: "",
        cell: ({ row }) => {
          const url = row.original.thumbnail_url;
          return url ? (
            <Image
              src={url}
              alt="Thumbnail"
              width={56}
              height={56}
              className="h-14 w-14 rounded-md object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
              N/A
            </div>
          );
        },
        size: 80,
        enableSorting: false,
      },
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
        sortingFn: (a, b) =>
          new Date(a.original.posted_at).getTime() -
          new Date(b.original.posted_at).getTime(),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{formatDate(String(getValue()))}</span>
        ),
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
        sortingFn: numericSort((row) => row.likes ?? 0),
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
        sortingFn: numericSort((row) => row.comments ?? 0),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "shares",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Shares
          </Button>
        ),
        sortingFn: numericSort((row) => row.shares ?? 0),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "saves",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Saves
          </Button>
        ),
        sortingFn: numericSort((row) => row.saves ?? 0),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "impressions",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Impressions
          </Button>
        ),
        sortingFn: numericSort((row) => row.impressions ?? 0),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "reach",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reach
          </Button>
        ),
        sortingFn: numericSort((row) => row.reach ?? 0),
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as number | null) ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "engagementRate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Engagement rate
          </Button>
        ),
        sortingFn: numericSort((row) => row.engagementRate ?? 0),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.engagementRate == null
              ? "—"
              : `${row.original.engagementRate}%`}
          </span>
        ),
      },
      {
        accessorKey: "engagementTotal",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Engagement total
          </Button>
        ),
        sortingFn: numericSort((row) => row.engagementTotal),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.engagementTotal.toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  // TanStack Table isn't yet supported by the React compiler; ignore compatibility warning.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter: postsSearch },
    onSortingChange: setSorting,
    onGlobalFilterChange: handleGlobalFilterChange,
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

  const columnCount = table.getAllColumns().length || 1;

  const openPost = (post: PostWithComputed) => {
    setSelected(post);
    setImageLoading(!!post.thumbnail_url);
    setOpen(true);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Sort columns, search captions, or filter by platform.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex gap-2">
            {([
              { value: "all", label: "All" },
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
            ] as const).map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={selectedPlatform === opt.value ? "default" : "outline"}
                onClick={() => setSelectedPlatform(opt.value)}
                aria-pressed={selectedPlatform === opt.value}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              value={postsSearch}
              onChange={(e) => setPostsSearch(e.target.value)}
              placeholder="Search caption or platform…"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: columnCount }).map((__, idx) => (
                    <TableCell key={`s-${i}-${idx}`} className="w-[120px]">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-sm text-red-600">
                  Failed to load posts: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : posts && posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-sm text-muted-foreground"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      No posts yet
                    </div>
                    <div>Create your first post to see analytics here.</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-sm text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => openPost(row.original)}
                >
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post details</DialogTitle>
            </DialogHeader>

            {selected ? (
              <div className="space-y-4 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="h-24 w-24">
                      {selected.thumbnail_url ? (
                        <div className="relative h-full w-full">
                          {imageLoading ? (
                            <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
                          ) : null}
                          <Image
                            src={selected.thumbnail_url}
                            alt="Post thumbnail"
                            width={120}
                            height={120}
                            className="h-24 w-24 rounded-lg object-cover"
                            onLoadingComplete={() => setImageLoading(false)}
                          />
                        </div>
                      ) : (
                        <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          No thumbnail
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Platform</div>
                      <div className="font-medium capitalize">
                        {selected.platform}
                      </div>
                      <div className="text-muted-foreground">Media</div>
                      <div className="font-medium capitalize">
                        {selected.media_type}
                      </div>
                      <div className="text-muted-foreground">Posted</div>
                      <div className="font-medium">
                        {new Date(selected.posted_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {selected.permalink ? (
                    <a
                      href={selected.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-md border px-3 text-sm font-medium"
                    >
                      View on platform
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No external link provided
                    </span>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Likes", value: selected.likes ?? 0 },
                    { label: "Comments", value: selected.comments ?? 0 },
                    { label: "Shares", value: selected.shares ?? 0 },
                    { label: "Saves", value: selected.saves ?? 0 },
                    { label: "Reach", value: selected.reach ?? 0 },
                    { label: "Impressions", value: selected.impressions ?? 0 },
                    {
                      label: "Engagement total",
                      value: selected.engagementTotal,
                    },
                    {
                      label: "Engagement rate",
                      value:
                        selected.engagementRate == null
                          ? "N/A"
                          : `${selected.engagementRate}%`,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-md border p-3">
                      <div className="text-muted-foreground">{stat.label}</div>
                      <div className="font-semibold tabular-nums">
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground">Caption</div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {selected.caption ?? "(no caption)"}
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
