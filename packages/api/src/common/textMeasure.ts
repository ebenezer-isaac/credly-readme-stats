/**
 * Character width table for 'Segoe UI' at base font size.
 * These are approximate widths relative to font size.
 * Based on github-readme-stats approach.
 */
const CHAR_WIDTHS: Record<string, number> = {
  " ": 0.275,
  "!": 0.305,
  '"': 0.38,
  "#": 0.58,
  $: 0.525,
  "%": 0.78,
  "&": 0.66,
  "'": 0.22,
  "(": 0.305,
  ")": 0.305,
  "*": 0.44,
  "+": 0.58,
  ",": 0.275,
  "-": 0.36,
  ".": 0.275,
  "/": 0.38,
  "0": 0.525,
  "1": 0.525,
  "2": 0.525,
  "3": 0.525,
  "4": 0.525,
  "5": 0.525,
  "6": 0.525,
  "7": 0.525,
  "8": 0.525,
  "9": 0.525,
  ":": 0.275,
  ";": 0.275,
  "<": 0.58,
  "=": 0.58,
  ">": 0.58,
  "?": 0.465,
  "@": 0.9,
  A: 0.6,
  B: 0.57,
  C: 0.565,
  D: 0.64,
  E: 0.5,
  F: 0.475,
  G: 0.64,
  H: 0.64,
  I: 0.24,
  J: 0.37,
  K: 0.555,
  L: 0.47,
  M: 0.78,
  N: 0.65,
  O: 0.67,
  P: 0.545,
  Q: 0.67,
  R: 0.57,
  S: 0.515,
  T: 0.525,
  U: 0.635,
  V: 0.58,
  W: 0.85,
  X: 0.545,
  Y: 0.525,
  Z: 0.545,
  "[": 0.305,
  "\\": 0.38,
  "]": 0.305,
  "^": 0.58,
  _: 0.44,
  "`": 0.38,
  a: 0.5,
  b: 0.54,
  c: 0.44,
  d: 0.545,
  e: 0.5,
  f: 0.305,
  g: 0.545,
  h: 0.54,
  i: 0.24,
  j: 0.24,
  k: 0.49,
  l: 0.24,
  m: 0.84,
  n: 0.54,
  o: 0.545,
  p: 0.54,
  q: 0.545,
  r: 0.36,
  s: 0.42,
  t: 0.34,
  u: 0.54,
  v: 0.48,
  w: 0.73,
  x: 0.48,
  y: 0.48,
  z: 0.44,
  "{": 0.36,
  "|": 0.27,
  "}": 0.36,
  "~": 0.58,
  "\u00B7": 0.33,  // middle dot (·) used in skill tags
};

const DEFAULT_CHAR_WIDTH = 0.55;
const BOLD_MULTIPLIER = 1.08;

/**
 * Measure text width in pixels at a given font size.
 * Uses pre-computed character width tables (no DOM needed).
 */
export function measureText(text: string, fontSize: number, bold = false): number {
  let width = 0;
  for (const char of text) {
    width += (CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH) * fontSize;
  }
  return bold ? width * BOLD_MULTIPLIER : width;
}

/**
 * Truncate text with ellipsis if exceeding maxWidth pixels.
 */
export function truncateText(text: string, maxWidthPx: number, fontSize: number, bold = false): string {
  if (measureText(text, fontSize, bold) <= maxWidthPx) return text;

  const ellipsis = "...";
  const ellipsisWidth = measureText(ellipsis, fontSize);
  const targetWidth = maxWidthPx - ellipsisWidth;

  let current = "";
  let currentWidth = 0;

  for (const char of text) {
    const charWidth = (CHAR_WIDTHS[char] ?? DEFAULT_CHAR_WIDTH) * fontSize;
    if (currentWidth + charWidth > targetWidth) break;
    current += char;
    currentWidth += charWidth;
  }

  return current + ellipsis;
}

/**
 * Wrap text into multiple lines at word boundaries.
 * Returns array of line strings, each fitting within maxWidthPx.
 */
export function wrapTextMultiline(
  text: string,
  maxWidthPx: number,
  fontSize: number,
  maxLines = 3,
): readonly string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measureText(testLine, fontSize) <= maxWidthPx) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        if (lines.length >= maxLines) break;
      }
      currentLine = word;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // Truncate last line if it still exceeds (immutable: build new array)
  if (lines.length > 0) {
    const lastIdx = lines.length - 1;
    const lastLine = lines[lastIdx] ?? "";
    if (measureText(lastLine, fontSize) > maxWidthPx) {
      return [
        ...lines.slice(0, lastIdx),
        truncateText(lastLine, maxWidthPx, fontSize),
      ];
    }
  }

  return lines;
}
