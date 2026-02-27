import type { NormalizedBadge, CarouselCardOptions } from "../types/card.js";
import { BaseCard, PADDING_X } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { clamp } from "../common/utils.js";
import { sortBadges, filterBadges } from "../common/badgeFilters.js";
import { buildCarouselSection } from "./sections/index.js";

const DEFAULT_VISIBLE_COUNT = 5;
const DEFAULT_BADGE_SIZE = 64;
const DEFAULT_INTERVAL = 3;
const DEFAULT_MAX_ITEMS = 12;

/** Render the Carousel Card SVG */
export function renderCarouselCard(
  badges: readonly NormalizedBadge[],
  options: CarouselCardOptions,
): string {
  const colors = getCardColors(options);
  const visibleCount = clamp(options.visible_count ?? DEFAULT_VISIBLE_COUNT, 1, 6);
  const badgeSize = clamp(options.badge_size ?? DEFAULT_BADGE_SIZE, 32, 128);
  const showName = options.show_name !== false;
  const showIssuer = options.show_issuer ?? false;
  const interval = clamp(options.interval ?? DEFAULT_INTERVAL, 1, 10);
  const maxItems = clamp(options.max_items ?? DEFAULT_MAX_ITEMS, 3, 30);
  const sort = options.sort ?? "recent";

  // Filter, sort, and limit
  let processed = filterBadges(badges, options.filter_issuer, options.filter_skill);
  processed = sortBadges(processed, sort);
  processed = processed.slice(0, maxItems);

  const GAP = 16;
  const viewportWidth = visibleCount * badgeSize + Math.max(0, visibleCount - 1) * GAP;
  const cardWidth = clamp(
    options.card_width ?? viewportWidth + PADDING_X * 2,
    200, 800,
  );

  const section = buildCarouselSection(processed, {
    visibleCount,
    badgeSize,
    showName,
    showIssuer,
    intervalSeconds: interval,
    contentWidth: cardWidth - PADDING_X * 2,
    disableAnimations: options.disable_animations ?? false,
    animationPrefix: "c",
  }, colors);

  const titleHeight = options.hide_title ? 35 : 55;
  const cardHeight = titleHeight + section.height + 20;
  const title = options.custom_title ?? `${options.username}'s Badge Carousel`;

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
    a11yDesc: `Badge carousel showing ${Math.min(visibleCount, processed.length)} of ${processed.length} badges`,
  });

  const body = `
    <g transform="translate(${PADDING_X}, 10)">
      ${section.svg}
    </g>
  `;

  return card.withCSS(section.css).render(body);
}
