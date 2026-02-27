import type { NormalizedBadge, CardColors, SectionResult } from "../../types/card.js";
import { encodeHTML, encodeAttr } from "../../common/utils.js";
import { truncateText } from "../../common/textMeasure.js";

const GAP = 16;

/** Options for the carousel section builder */
export interface CarouselSectionOptions {
  readonly visibleCount: number;
  readonly badgeSize: number;
  readonly showName: boolean;
  readonly showIssuer: boolean;
  readonly intervalSeconds: number;
  readonly contentWidth: number;
  readonly disableAnimations: boolean;
  readonly animationPrefix: string;
}

/**
 * Generate CSS @keyframes for the sliding carousel.
 *
 * For N items, we generate N steps. Each step pauses at a position then transitions
 * to the next. First V items are duplicated at the end of the strip so
 * the animation seamlessly loops back to the start.
 */
function generateCarouselKeyframes(
  totalItems: number,
  cellWidth: number,
  prefix: string,
  intervalSeconds: number,
): { readonly keyframes: string; readonly duration: number } {
  const stepPct = 100 / totalItems;
  const duration = totalItems * intervalSeconds;

  let frames = `@keyframes ${prefix}-slide {\n`;
  for (let i = 0; i <= totalItems; i++) {
    const translateX = -(i * cellWidth);
    if (i < totalItems) {
      const pauseStart = i * stepPct;
      const transitionStart = pauseStart + stepPct * 0.75;
      frames += `  ${pauseStart.toFixed(2)}% { transform: translateX(${translateX}px); }\n`;
      frames += `  ${transitionStart.toFixed(2)}% { transform: translateX(${translateX}px); }\n`;
    } else {
      frames += `  100% { transform: translateX(${translateX}px); }\n`;
    }
  }
  frames += `}\n`;

  return { keyframes: frames, duration };
}

/**
 * Generate CSS @keyframes for indicator dots.
 * Each dot lights up when its corresponding item is in the leftmost visible position.
 */
function generateDotKeyframes(
  totalItems: number,
  prefix: string,
  intervalSeconds: number,
): string {
  const duration = totalItems * intervalSeconds;

  return Array.from({ length: totalItems }, (_, i) => {
    const kfName = `${prefix}-dot-${i}`;
    const activeStart = ((i / totalItems) * 100).toFixed(2);
    const activeEnd = (((i + 1) / totalItems) * 100).toFixed(2);

    return `
      @keyframes ${kfName} {
        0%, ${activeStart}% { opacity: 0.3; }
        ${activeStart}%, ${activeEnd}% { opacity: 1; }
        ${activeEnd}%, 100% { opacity: 0.3; }
      }
      .${prefix}-dot-${i} {
        animation: ${kfName} ${duration}s linear infinite;
      }`;
  }).join("\n");
}

/**
 * Build the carousel section SVG fragment.
 * Returns { svg, css, height } for composition in CarouselCard and OverviewCard.
 */
export function buildCarouselSection(
  badges: readonly NormalizedBadge[],
  options: CarouselSectionOptions,
  colors: CardColors,
): SectionResult {
  const {
    visibleCount, badgeSize, showName, showIssuer,
    intervalSeconds, contentWidth, disableAnimations, animationPrefix: p,
  } = options;

  const N = badges.length;
  const V = Math.min(visibleCount, N);

  if (N === 0) {
    return { svg: "", css: "", height: 0 };
  }

  const nameHeight = showName ? 18 : 0;
  const issuerHeight = showIssuer ? 14 : 0;
  const cellHeight = badgeSize + nameHeight + issuerHeight;
  const cellWidth = badgeSize + GAP;

  const viewportWidth = V * badgeSize + Math.max(0, V - 1) * GAP;
  const offsetX = Math.max(0, Math.floor((contentWidth - viewportWidth) / 2));

  const isStatic = N <= visibleCount;

  // Build the strip: all badges + duplicated first V for seamless loop
  const stripBadges = isStatic ? [...badges] : [...badges, ...badges.slice(0, V)];

  const cells = stripBadges
    .map((badge, i) => {
      const x = i * cellWidth;
      const imageHref = badge.imageBase64 ?? badge.imageUrl;
      const truncatedName = truncateText(badge.name, cellWidth - 4, 11);
      const truncatedIssuer = truncateText(badge.issuerName, cellWidth - 4, 10);

      let cellSvg = `
        <a href="${encodeAttr(badge.credlyUrl)}" target="_blank">
        <g transform="translate(${x}, 0)">
          <image href="${encodeAttr(imageHref)}" x="0" y="0" width="${badgeSize}" height="${badgeSize}" />`;

      if (showName) {
        cellSvg += `
          <text x="${badgeSize / 2}" y="${badgeSize + 14}" text-anchor="middle" class="${p}-badge-name">${encodeHTML(truncatedName)}</text>`;
      }

      if (showIssuer) {
        const iy = badgeSize + nameHeight + 12;
        cellSvg += `
          <text x="${badgeSize / 2}" y="${iy}" text-anchor="middle" class="${p}-badge-issuer">${encodeHTML(truncatedIssuer)}</text>`;
      }

      cellSvg += `\n        </g>\n        </a>`;
      return cellSvg;
    })
    .join("");

  // Clip path to restrict visible area
  const clipId = `${p}-clip`;
  const clipDef = `
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="-2" width="${viewportWidth}" height="${cellHeight + 4}" />
      </clipPath>
    </defs>`;

  const stripClass = `${p}-strip`;
  const stripSvg = `
    ${clipDef}
    <g transform="translate(${offsetX}, 0)">
      <g clip-path="url(#${clipId})">
        <g class="${stripClass}">
          ${cells}
        </g>
      </g>
    </g>`;

  // Animation CSS
  let animationCss = "";
  if (!isStatic && !disableAnimations) {
    const { keyframes, duration } = generateCarouselKeyframes(N, cellWidth, p, intervalSeconds);
    animationCss = `
      ${keyframes}
      .${stripClass} {
        animation: ${p}-slide ${duration}s linear infinite;
      }`;
  }

  // Indicator dots
  let dotsHeight = 0;
  let dotsSvg = "";
  if (N > V) {
    const dotRadius = 3;
    const dotGap = 8;
    const dotsWidth = N * (dotRadius * 2 + dotGap) - dotGap;
    const dotsOffsetX = offsetX + Math.floor((viewportWidth - dotsWidth) / 2);
    const dotsY = cellHeight + 12;
    dotsHeight = 12 + dotRadius * 2 + 4;

    dotsSvg = badges
      .map((_, i) => {
        const cx = dotsOffsetX + i * (dotRadius * 2 + dotGap) + dotRadius;
        return `<circle cx="${cx}" cy="${dotsY + dotRadius}" r="${dotRadius}" class="${p}-dot-${i}" fill="${colors.iconColor}" opacity="0.3" />`;
      })
      .join("\n    ");

    if (!disableAnimations) {
      animationCss += generateDotKeyframes(N, p, intervalSeconds);
    }
  }

  // Footer text
  const footerY = cellHeight + dotsHeight + 14;
  const footerSvg = `
    <text x="${offsetX + Math.floor(viewportWidth / 2)}" y="${footerY}" text-anchor="middle" class="${p}-footer">
      ${V} of ${N} badges
    </text>`;

  const totalHeight = footerY + 10;

  const nameCss = showName
    ? `.${p}-badge-name { font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.textColor}; }`
    : "";
  const issuerCss = showIssuer
    ? `.${p}-badge-issuer { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.badgeLabelColor}; }`
    : "";

  const css = `
    ${nameCss}
    ${issuerCss}
    .${p}-footer {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
    ${animationCss}`;

  const svg = `
    ${stripSvg}
    ${dotsSvg}
    ${footerSvg}`;

  return { svg, css, height: totalHeight };
}
