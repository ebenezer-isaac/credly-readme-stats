export interface ParamDef {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

export const COMMON_PARAMS: readonly ParamDef[] = [
  { name: "username", type: "string", default: "required", description: "Your Credly username (from profile URL)" },
  { name: "theme", type: "string", default: "default", description: "Named theme preset" },
  { name: "title_color", type: "hex", default: "theme", description: "Title text color" },
  { name: "text_color", type: "hex", default: "theme", description: "Body text color" },
  { name: "icon_color", type: "hex", default: "theme", description: "Icon color" },
  { name: "bg_color", type: "hex/gradient", default: "theme", description: "Background color (angle,c1,c2 for gradient)" },
  { name: "border_color", type: "hex", default: "theme", description: "Border color" },
  { name: "hide_border", type: "boolean", default: "false", description: "Hide card border" },
  { name: "hide_title", type: "boolean", default: "false", description: "Hide card title" },
  { name: "custom_title", type: "string", default: "auto", description: "Custom title text" },
  { name: "disable_animations", type: "boolean", default: "false", description: "Disable CSS animations" },
  { name: "cache_seconds", type: "number", default: "21600", description: "Cache TTL in seconds (7200-86400)" },
];

export const STATS_PARAMS: readonly ParamDef[] = [
  { name: "show_icons", type: "boolean", default: "true", description: "Show stat row icons" },
  { name: "hide", type: "string", default: '""', description: "Hide stats: total, issuers, skills, active, expiring, top_issuers, top_skills" },
  { name: "card_width", type: "number", default: "495", description: "Card width in px (300-800)" },
  { name: "line_height", type: "number", default: "25", description: "Stat row spacing in px" },
];

export const GRID_PARAMS: readonly ParamDef[] = [
  { name: "columns", type: "number", default: "3", description: "Grid columns (1-6)" },
  { name: "rows", type: "number", default: "2", description: "Grid rows (1-10)" },
  { name: "badge_size", type: "number", default: "64", description: "Badge image size in px (32-128)" },
  { name: "show_name", type: "boolean", default: "true", description: "Show badge name" },
  { name: "show_issuer", type: "boolean", default: "false", description: "Show issuer name" },
  { name: "sort", type: "enum", default: "recent", description: "Sort: recent, oldest, name, issuer" },
  { name: "filter_issuer", type: "string", default: '""', description: "Comma-separated issuer filter" },
  { name: "filter_skill", type: "string", default: '""', description: "Comma-separated skill filter" },
  { name: "page", type: "number", default: "1", description: "Grid page for pagination" },
];

export const TIMELINE_PARAMS: readonly ParamDef[] = [
  { name: "max_items", type: "number", default: "6", description: "Max timeline entries (1-20)" },
  { name: "show_description", type: "boolean", default: "false", description: "Show badge description" },
  { name: "show_skills", type: "boolean", default: "true", description: "Show skill tags" },
  { name: "sort", type: "enum", default: "recent", description: "Sort: recent, oldest" },
  { name: "filter_issuer", type: "string", default: '""', description: "Issuer filter" },
  { name: "card_width", type: "number", default: "495", description: "Card width in px (400-800)" },
];
