"use client";

import { create } from "zustand";

type ChartMode = "line" | "area";
type PlatformFilter = "all" | "instagram" | "tiktok";

type DashboardUIState = {
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;

  selectedPlatform: PlatformFilter;
  setSelectedPlatform: (platform: PlatformFilter) => void;

  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;

  isPostModalOpen: boolean;
  setPostModalOpen: (open: boolean) => void;

  postsSearch: string;
  setPostsSearch: (search: string) => void;
};

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  chartMode: "line",
  setChartMode: (mode) => set({ chartMode: mode }),

  selectedPlatform: "all",
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),

  isPostModalOpen: false,
  setPostModalOpen: (open) => set({ isPostModalOpen: open }),

  postsSearch: "",
  setPostsSearch: (search) => set({ postsSearch: search }),
}));
