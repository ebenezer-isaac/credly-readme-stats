export type CardType = "stats" | "grid" | "timeline" | "carousel" | "overview";

export interface BuilderState {
  readonly username: string;
  readonly cardType: CardType;
  readonly theme: string;
  readonly title_color: string;
  readonly text_color: string;
  readonly icon_color: string;
  readonly bg_color: string;
  readonly border_color: string;
  readonly hide_border: boolean;
  readonly hide_title: boolean;
  readonly custom_title: string;
  readonly disable_animations: boolean;
  // Stats-specific
  readonly show_icons: boolean;
  readonly hide: string;
  readonly card_width: number;
  readonly line_height: number;
  // Grid-specific
  readonly columns: number;
  readonly rows: number;
  readonly badge_size: number;
  readonly show_name: boolean;
  readonly show_issuer: boolean;
  readonly sort: string;
  // Timeline-specific
  readonly max_items: number;
  readonly show_description: boolean;
  readonly show_skills: boolean;
  // Carousel/Overview-specific
  readonly visible_count: number;
  readonly interval: number;
  readonly filter_issuer: string;
  readonly filter_skill: string;
}

export const DEFAULT_STATE: BuilderState = {
  username: "",
  cardType: "stats",
  theme: "default",
  title_color: "",
  text_color: "",
  icon_color: "",
  bg_color: "",
  border_color: "",
  hide_border: false,
  hide_title: false,
  custom_title: "",
  disable_animations: false,
  show_icons: true,
  hide: "",
  card_width: 495,
  line_height: 25,
  columns: 3,
  rows: 2,
  badge_size: 64,
  show_name: true,
  show_issuer: false,
  sort: "recent",
  max_items: 6,
  show_description: false,
  show_skills: true,
  visible_count: 5,
  interval: 3,
  filter_issuer: "",
  filter_skill: "",
};
