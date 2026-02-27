const HEX_3 = /^#?([0-9a-fA-F]{3})$/;
const HEX_6 = /^#?([0-9a-fA-F]{6})$/;
const HEX_8 = /^#?([0-9a-fA-F]{8})$/;

/** Validate a hex color string (3, 6, or 8 chars, with or without #) */
export function isValidHexColor(color: string): boolean {
  return HEX_3.test(color) || HEX_6.test(color) || HEX_8.test(color);
}

/**
 * Normalize hex color to 6-digit format with # prefix.
 * "abc" -> "#aabbcc", "ff0000" -> "#ff0000"
 * Returns original if invalid.
 */
export function normalizeHex(color: string): string {
  const stripped = color.replace(/^#/, "");

  if (HEX_3.test(stripped)) {
    const expanded = stripped
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }

  if (HEX_6.test(stripped) || HEX_8.test(stripped)) {
    return `#${stripped.toLowerCase()}`;
  }

  return color;
}

/** Gradient background definition */
export interface GradientDef {
  readonly angle: number;
  readonly colors: readonly string[];
}

/**
 * Parse gradient string: "angle,color1,color2,..." -> GradientDef
 * Returns null if not a valid gradient format.
 */
export function parseGradient(bgColor: string): GradientDef | null {
  if (!bgColor.includes(",")) return null;

  const parts = bgColor.split(",").map((s) => s.trim());
  if (parts.length < 3) return null;

  const anglePart = parts[0];
  if (anglePart === undefined) return null;
  const angle = parseInt(anglePart, 10);
  if (Number.isNaN(angle)) return null;

  const colors = parts.slice(1);
  if (!colors.every((c) => isValidHexColor(c))) return null;

  return {
    angle,
    colors: colors.map((c) => normalizeHex(c)),
  };
}

/**
 * Resolve a color from user override, theme, or default.
 * Returns normalized hex string.
 */
export function resolveColor(
  userColor: string | undefined,
  themeColor: string,
  defaultColor: string,
): string {
  if (userColor && isValidHexColor(userColor)) {
    return normalizeHex(userColor);
  }
  return normalizeHex(themeColor || defaultColor);
}
