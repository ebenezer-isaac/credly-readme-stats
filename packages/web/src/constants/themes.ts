export interface ThemePreview {
  readonly name: string;
  readonly label: string;
  readonly bg: string;
  readonly title: string;
  readonly text: string;
  readonly icon: string;
  readonly border: string;
}

export const THEMES: readonly ThemePreview[] = [
  { name: "default", label: "Default", bg: "#fffefe", title: "#2f80ed", text: "#434d58", icon: "#4c71f2", border: "#e4e2e2" },
  { name: "dark", label: "Dark", bg: "#151515", title: "#fff", text: "#9f9f9f", icon: "#79ff97", border: "#e4e2e2" },
  { name: "radical", label: "Radical", bg: "#141321", title: "#fe428e", text: "#a9fef7", icon: "#f8d847", border: "#fe428e" },
  { name: "merko", label: "Merko", bg: "#0a0f0b", title: "#abd200", text: "#68b587", icon: "#b7d364", border: "#abd200" },
  { name: "gruvbox", label: "Gruvbox", bg: "#282828", title: "#fabd2f", text: "#ebdbb2", icon: "#fe8019", border: "#ebdbb2" },
  { name: "tokyonight", label: "Tokyo Night", bg: "#1a1b27", title: "#70a5fd", text: "#38bdae", icon: "#bf91f3", border: "#70a5fd" },
  { name: "onedark", label: "One Dark", bg: "#282c34", title: "#e4bf7a", text: "#abb2bf", icon: "#8eb573", border: "#abb2bf" },
  { name: "cobalt", label: "Cobalt", bg: "#193549", title: "#e8e8e8", text: "#75eeb2", icon: "#0480ef", border: "#e8e8e8" },
  { name: "synthwave", label: "Synthwave", bg: "#2b213a", title: "#e2e9ec", text: "#e5289e", icon: "#ef8539", border: "#e5289e" },
  { name: "dracula", label: "Dracula", bg: "#282a36", title: "#ff6e96", text: "#f8f8f2", icon: "#79dafa", border: "#6272a4" },
  { name: "nord", label: "Nord", bg: "#2e3440", title: "#88c0d0", text: "#d8dee9", icon: "#81a1c1", border: "#4c566a" },
  { name: "catppuccin_mocha", label: "Catppuccin Mocha", bg: "#1e1e2e", title: "#cba6f7", text: "#cdd6f4", icon: "#89b4fa", border: "#585b70" },
  { name: "catppuccin_latte", label: "Catppuccin Latte", bg: "#eff1f5", title: "#8839ef", text: "#4c4f69", icon: "#1e66f5", border: "#9ca0b0" },
  { name: "rose_pine", label: "Rose Pine", bg: "#191724", title: "#9ccfd8", text: "#e0def4", icon: "#c4a7e7", border: "#403d52" },
  { name: "github_dark", label: "GitHub Dark", bg: "#0d1117", title: "#58a6ff", text: "#c9d1d9", icon: "#1f6feb", border: "#30363d" },
  { name: "github_light", label: "GitHub Light", bg: "#ffffff", title: "#0969da", text: "#24292f", icon: "#0969da", border: "#d0d7de" },
  { name: "aura", label: "Aura", bg: "#15141b", title: "#a277ff", text: "#edecee", icon: "#ffca85", border: "#a277ff" },
  { name: "neon", label: "Neon", bg: "#0d0221", title: "#ff00ff", text: "#00ffff", icon: "#ff00ff", border: "#ff00ff" },
  { name: "react", label: "React", bg: "#20232a", title: "#61dafb", text: "#ffffff", icon: "#61dafb", border: "#61dafb" },
  { name: "vue", label: "Vue", bg: "#35495e", title: "#41b883", text: "#ffffff", icon: "#41b883", border: "#41b883" },
] as const;
