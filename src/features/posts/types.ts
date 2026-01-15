import type { PostRow } from "./usePosts";

export type PostWithComputed = PostRow & {
  engagementTotal: number;
  engagementRate: number | null;
};
