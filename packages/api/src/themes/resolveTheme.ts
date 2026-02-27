import type { BaseCardOptions, CardColors } from "../types/card.js";
import type { ThemeDefinition, ThemeName } from "../types/theme.js";
import { resolveColor, parseGradient, normalizeHex } from "../common/colorUtils.js";
import { themes } from "./themes.js";

const DEFAULT_THEME = themes.default;

/** Look up a theme by name. Returns default for unknown names. */
export function getTheme(name: string | undefined): ThemeDefinition {
  if (!name) return DEFAULT_THEME;
  if (!(name in themes)) return DEFAULT_THEME;
  return themes[name as ThemeName];
}

/** List all available theme names */
export function getThemeNames(): readonly string[] {
  return Object.keys(themes);
}

/**
 * Resolve card colors from: user overrides -> theme -> default theme.
 * Handles gradient parsing for bg_color.
 */
export function getCardColors(options: BaseCardOptions): CardColors {
  const theme = getTheme(options.theme);

  const titleColor = resolveColor(options.title_color, theme.title_color, DEFAULT_THEME.title_color);
  const textColor = resolveColor(options.text_color, theme.text_color, DEFAULT_THEME.text_color);
  const iconColor = resolveColor(options.icon_color, theme.icon_color, DEFAULT_THEME.icon_color);
  const borderColor = resolveColor(
    options.border_color,
    theme.border_color,
    DEFAULT_THEME.border_color,
  );
  const badgeLabelColor = resolveColor(
    options.badge_label_color,
    theme.badge_label_color,
    DEFAULT_THEME.badge_label_color,
  );

  // Handle bg_color: could be solid hex or gradient
  let bgColor: string | readonly string[];
  if (options.bg_color) {
    const gradient = parseGradient(options.bg_color);
    if (gradient) {
      bgColor = [String(gradient.angle), ...gradient.colors];
    } else {
      bgColor = resolveColor(options.bg_color, theme.bg_color, DEFAULT_THEME.bg_color);
    }
  } else {
    bgColor = normalizeHex(theme.bg_color || DEFAULT_THEME.bg_color);
  }

  return { titleColor, textColor, iconColor, bgColor, borderColor, badgeLabelColor };
}
