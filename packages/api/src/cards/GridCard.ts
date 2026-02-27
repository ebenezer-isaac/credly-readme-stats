import type { NormalizedBadge, GridCardOptions } from "../types/card.js";
import { BaseCard, PADDING_X } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { encodeHTML, encodeAttr, clamp } from "../common/utils.js";
import { truncateText } from "../common/textMeasure.js";
import { sortBadges, filterBadges } from "../common/badgeFilters.js";

const GAP_X = 16;
const GAP_Y = 12;

/** Render the Grid Card SVG */
export function renderGridCard(
  badges: readonly NormalizedBadge[],
  options: GridCardOptions,
): string {
  const colors = getCardColors(options);
  const columns = clamp(options.columns ?? 3, 1, 6);
  const rows = clamp(options.rows ?? 2, 1, 10);
  const badgeSize = clamp(options.badge_size ?? 64, 32, 128);
  const showName = options.show_name !== false;
  const showIssuer = options.show_issuer ?? false;
  const sort = options.sort ?? "recent";
  const page = clamp(options.page ?? 1, 1, 100);

  // Filter and sort
  let processed = filterBadges(badges, options.filter_issuer, options.filter_skill);
  processed = sortBadges(processed, sort);

  // Paginate
  const maxItems = columns * rows;
  const startIdx = (page - 1) * maxItems;
  const pageBadges = processed.slice(startIdx, startIdx + maxItems);

  // Calculate dimensions
  const nameHeight = showName ? 18 : 0;
  const issuerHeight = showIssuer ? 14 : 0;
  const cellWidth = badgeSize;
  const cellHeight = badgeSize + nameHeight + issuerHeight;
  const contentWidth = columns * cellWidth + (columns - 1) * GAP_X;
  const cardWidth = clamp(options.card_width ?? contentWidth + PADDING_X * 2, 200, 1200);

  const actualRows = Math.ceil(pageBadges.length / columns);
  const contentHeight = actualRows * cellHeight + Math.max(0, actualRows - 1) * GAP_Y;
  const titleHeight = options.hide_title ? 35 : 55;
  const cardHeight = titleHeight + contentHeight + 20;

  // Build grid cells
  const cells = pageBadges
    .map((badge, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PADDING_X + col * (cellWidth + GAP_X);
      const y = row * (cellHeight + GAP_Y);
      const delay = 600 + i * 100;

      const imageHref = badge.imageBase64 ?? badge.imageUrl;
      const truncatedName = truncateText(badge.name, cellWidth + GAP_X - 4, 11);
      const truncatedIssuer = truncateText(badge.issuerName, cellWidth + GAP_X - 4, 10);

      let cellSvg = `
      <a href="${encodeAttr(badge.credlyUrl)}" target="_blank">
      <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(${x}, ${y})">
        <image href="${encodeAttr(imageHref)}" x="0" y="0" width="${badgeSize}" height="${badgeSize}" />`;

      if (showName) {
        cellSvg += `
        <text x="${cellWidth / 2}" y="${badgeSize + 14}" text-anchor="middle" class="badge-name">${encodeHTML(truncatedName)}</text>`;
      }

      if (showIssuer) {
        const issuerY = badgeSize + nameHeight + 12;
        cellSvg += `
        <text x="${cellWidth / 2}" y="${issuerY}" text-anchor="middle" class="badge-issuer">${encodeHTML(truncatedIssuer)}</text>`;
      }

      cellSvg += `\n      </g>\n      </a>`;
      return cellSvg;
    })
    .join("");

  const title = options.custom_title ?? `${options.username}'s Badges`;

  const card = new BaseCard({
    width: cardWidth,
    height: cardHeight,
    borderRadius: options.border_radius,
    colors,
    customTitle: options.custom_title,
    defaultTitle: title,
    hideBorder: options.hide_border,
    hideTitle: options.hide_title,
    disableAnimations: options.disable_animations,
    a11yTitle: title,
    a11yDesc: `Badge grid showing ${pageBadges.length} of ${processed.length} badges`,
    titleUrl: options.profile_url,
  });

  const css = `
    .badge-name {
      font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .badge-issuer {
      font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
  `;

  return card.withCSS(css).render(cells);
}
