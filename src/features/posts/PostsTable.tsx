"use client";

import { flexRender } from "@tanstack/react-table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PostDetailsModal } from "@/features/posts/PostDetailsModal";
import { usePostsTable } from "@/features/posts/usePostsTable";

export default function PostsTable() {
  const {
    headerGroups,
    rows,
    columnCount,
    isLoading,
    error,
    hasPosts,
    platformFilters,
    selectedPlatform,
    postsSearch,
    handleSearchChange,
    selectedPost,
    isPostModalOpen,
    closeModal,
    getRowClickHandler,
  } = usePostsTable();

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
            {platformFilters.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={selectedPlatform === opt.value ? "default" : "outline"}
                onClick={opt.onClick}
                aria-pressed={selectedPlatform === opt.value}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              value={postsSearch}
              onChange={handleSearchChange}
              placeholder="Search caption or platform…"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            {headerGroups.map((hg) => (
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
                <TableCell
                  colSpan={columnCount}
                  className="text-sm text-red-600"
                >
                  Failed to load posts: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : !hasPosts ? (
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
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-sm text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={getRowClickHandler(row.original)}
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
        <PostDetailsModal
          open={isPostModalOpen}
          post={selectedPost}
          onClose={closeModal}
        />
      </div>
    </section>
  );
}
