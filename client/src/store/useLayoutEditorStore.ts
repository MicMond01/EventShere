import { create } from "zustand";

type EditorTool = "select" | "move" | "rotate" | "scale" | "zone" | "measure";

interface LayoutEditorState {
  activeTool: EditorTool;
  snapToGrid: boolean;
  showGrid: boolean;
  showLabels: boolean;
  gridSize: number;
  setActiveTool: (tool: EditorTool) => void;
  toggleSnapToGrid: () => void;
  toggleGrid: () => void;
  toggleLabels: () => void;
  setGridSize: (size: number) => void;
}

export const useLayoutEditorStore = create<LayoutEditorState>((set) => ({
  activeTool: "select",
  snapToGrid: true,
  showGrid: true,
  showLabels: true,
  gridSize: 0.5,
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleSnapToGrid: () =>
    set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setGridSize: (size) => set({ gridSize: size }),
}));
