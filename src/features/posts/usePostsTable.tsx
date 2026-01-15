import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { formatDateShort } from "@/lib/format";
import { usePosts } from "@/features/posts/usePosts";
import { useDashboardUIStore } from "@/features/dashboard/useDashboardUIStore";
import { Button } from "@/components/ui/button";
import type { PostWithComputed } from "@/features/posts/types";

type NumericSorter = (
  fn: (row: PostWithComputed) => number
) => (a: { original: PostWithComputed }, b: { original: PostWithComputed }) => number;

const numericSort: NumericSorter =
  (fn) =>
  (a, b) =>
    fn(a.original) - fn(b.original);

const platformOptions = [
  { value: "all", label: "All" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
] as const;

function buildColumns(): ColumnDef<PostWithComputed>[] {
  return [
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
        <span className="whitespace-nowrap">
          {formatDateShort(String(getValue()))}
        </span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
        <span className="tabular-nums">{(getValue() as number | null) ?? 0}</span>
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
  ];
}

export function usePostsTable() {
  const { data: posts, isLoading, error } = usePosts();
  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    postsSearch,
    setPostsSearch,
    selectedPlatform,
    setSelectedPlatform,
    selectedPostId,
    setSelectedPostId,
    isPostModalOpen,
    setPostModalOpen,
  } = useDashboardUIStore();

  const handleGlobalFilterChange = useCallback(
    (value: Updater<string>) => {
      const next = typeof value === "function" ? value(postsSearch) : value;
      setPostsSearch(next);
    },
    [postsSearch, setPostsSearch]
  );

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

  const selectedPost = useMemo(
    () => computed.find((p) => p.id === selectedPostId) ?? null,
    [computed, selectedPostId]
  );

  const columns = useMemo<ColumnDef<PostWithComputed>[]>(
    () => buildColumns(),
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
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();

  const openPost = useCallback(
    (post: PostWithComputed) => {
      setSelectedPostId(post.id);
      setPostModalOpen(true);
    },
    [setPostModalOpen, setSelectedPostId]
  );

  const closeModal = useCallback(() => {
    setPostModalOpen(false);
    setSelectedPostId(null);
  }, [setPostModalOpen, setSelectedPostId]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPostsSearch(e.target.value);
  }, [setPostsSearch]);

  const platformFilters = useMemo(
    () =>
      platformOptions.map((opt) => ({
        ...opt,
        onClick: () => setSelectedPlatform(opt.value),
      })),
    [setSelectedPlatform]
  );

  const getRowClickHandler = useCallback(
    (post: PostWithComputed) => () => openPost(post),
    [openPost]
  );

  return {
    table,
    rows,
    headerGroups,
    columnCount,
    isLoading,
    error,
    hasPosts: (posts?.length ?? 0) > 0,
    platformFilters,
    selectedPlatform,
    postsSearch,
    handleSearchChange,
    selectedPost,
    isPostModalOpen,
    closeModal,
    openPost,
    getRowClickHandler,
  };
}
