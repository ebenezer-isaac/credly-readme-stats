import type { CardColors } from "../types/card.js";
import type { ErrorInfo } from "../middleware/errorHandler.js";
import { encodeHTML } from "../common/utils.js";

const ERROR_WIDTH = 400;
const ERROR_HEIGHT = 120;

/** Render an error card SVG */
export function renderErrorCard(
  error: ErrorInfo,
  colors?: Partial<CardColors>,
): string {
  const titleColor = colors?.titleColor ?? "#e74c3c";
  const textColor = colors?.textColor ?? "#434d58";
  const bgColor = typeof colors?.bgColor === "string" ? colors.bgColor : "#fffefe";
  const borderColor = colors?.borderColor ?? "#e4e2e2";
  const suggestionColor = colors?.badgeLabelColor ?? "#858585";

  return `
<svg width="${ERROR_WIDTH}" height="${ERROR_HEIGHT}" viewBox="0 0 ${ERROR_WIDTH} ${ERROR_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="descId">
  <title id="titleId">Error</title>
  <desc id="descId">${encodeHTML(error.message)}</desc>
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .message { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor}; }
    .suggestion { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${suggestionColor}; }
  </style>

  <rect x="0.5" y="0.5" rx="4.5" height="99%" width="${ERROR_WIDTH - 1}" fill="${bgColor}" stroke="${borderColor}" />

  <g transform="translate(25, 35)">
    <svg x="0" y="-13" viewBox="0 0 16 16" width="16" height="16" fill="${titleColor}">
      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9-3a1 1 0 11-2 0 1 1 0 012 0zM7 7.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4z"/>
    </svg>
    <text x="25" y="0" class="header">Something went wrong</text>
  </g>

  <g transform="translate(25, 65)">
    <text class="message">${encodeHTML(error.message)}</text>
    <text y="20" class="suggestion">${encodeHTML(error.suggestion)}</text>
  </g>
</svg>`.trim();
}
