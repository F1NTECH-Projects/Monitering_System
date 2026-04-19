"use client";
import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setCollapsed: (v) => set({ isCollapsed: v }),
}));

export const useSidebar = useSidebarStore;
