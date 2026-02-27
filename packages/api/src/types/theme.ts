/** Shape of a single theme definition */
export interface ThemeDefinition {
  readonly title_color: string;
  readonly text_color: string;
  readonly icon_color: string;
  readonly bg_color: string;
  readonly border_color: string;
  readonly badge_label_color: string;
}

/** Union of all built-in theme names */
export type ThemeName =
  | "default"
  | "dark"
  | "radical"
  | "merko"
  | "gruvbox"
  | "tokyonight"
  | "onedark"
  | "cobalt"
  | "synthwave"
  | "dracula"
  | "nord"
  | "catppuccin_mocha"
  | "catppuccin_latte"
  | "rose_pine"
  | "github_dark"
  | "github_light"
  | "aura"
  | "neon"
  | "react"
  | "vue";

/** The themes map type */
export type ThemesMap = Readonly<Record<ThemeName, ThemeDefinition>>;
