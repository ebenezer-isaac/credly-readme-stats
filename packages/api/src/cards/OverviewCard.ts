import type { NormalizedBadge, BadgeStats, OverviewCardOptions } from "../types/card.js";
import { BaseCard, PADDING_X } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { clamp, parseArray } from "../common/utils.js";
import { sortBadges, filterBadges } from "../common/badgeFilters.js";
import { buildStatsSection, STAT_ICONS, buildCarouselSection } from "./sections/index.js";

const DEFAULT_CARD_WIDTH = 550;
const MIN_CARD_WIDTH = 350;
const MAX_CARD_WIDTH = 800;
const SECTION_GAP = 20;

/** Render the Overview Card SVG (stats + carousel combined) */
export function renderOverviewCard(
  stats: BadgeStats,
  badges: readonly NormalizedBadge[],
  options: OverviewCardOptions,
): string {
  const colors = getCardColors(options);
  const hiddenStats = new Set(parseArray(options.hide));
  const hideCarousel = hiddenStats.has("carousel");
  const cardWidth = clamp(options.card_width ?? DEFAULT_CARD_WIDTH, MIN_CARD_WIDTH, MAX_CARD_WIDTH);

  // Build stats section
  const statsSection = buildStatsSection(stats, {
    showIcons: options.show_icons !== false,
    hiddenStats,
    lineHeight: clamp(options.line_height ?? 25, 20, 40),
    contentWidth: cardWidth - 50,
    disableAnimations: options.disable_animations ?? false,
  }, colors);

  let totalCss = statsSection.css;
  let totalHeight = statsSection.height;
  let carouselSvg = "";

  // Build carousel section (unless hidden)
  if (!hideCarousel) {
    const visibleCount = clamp(options.visible_count ?? 5, 1, 6);
    const badgeSize = clamp(options.badge_size ?? 64, 32, 128);
    const maxItems = clamp(options.max_items ?? 12, 3, 30);

    let processed = filterBadges(badges, options.filter_issuer, options.filter_skill);
    processed = sortBadges(processed, options.sort);
    processed = processed.slice(0, maxItems);

    const carouselSection = buildCarouselSection(processed, {
      visibleCount,
      badgeSize,
      showName: options.show_name !== false,
      showIssuer: options.show_issuer ?? false,
      intervalSeconds: clamp(options.interval ?? 3, 1, 10),
      contentWidth: cardWidth - PADDING_X * 2,
      disableAnimations: options.disable_animations ?? false,
      animationPrefix: "oc",
    }, colors);

    if (carouselSection.height > 0) {
      // Separator line between stats and carousel
      const separatorY = totalHeight + 5;
      const separatorSvg = `
        <line x1="${PADDING_X}" y1="${separatorY}" x2="${cardWidth - PADDING_X}" y2="${separatorY}"
              stroke="${colors.borderColor}" stroke-width="1" stroke-opacity="0.4" />`;

      carouselSvg = `
        ${separatorSvg}
        <g transform="translate(${PADDING_X}, ${totalHeight + SECTION_GAP})">
          ${carouselSection.svg}
        </g>`;

      totalCss += "\n" + carouselSection.css;
      totalHeight += SECTION_GAP + carouselSection.height;
    }
  }

  const cardHeight = 55 + totalHeight + 25;
  const title = options.custom_title ?? `${options.username}'s Credly Overview`;

  const card = new BaseCard({
    width: cardWidth,
    height: cardHeight,
    borderRadius: options.border_radius,
    colors,
    customTitle: options.custom_title,
    defaultTitle: title,
    titlePrefixIcon: STAT_ICONS.badge,
    hideBorder: options.hide_border,
    hideTitle: options.hide_title,
    disableAnimations: options.disable_animations,
    a11yTitle: title,
    a11yDesc: `Credly overview: ${stats.totalBadges} badges with carousel`,
    titleUrl: options.profile_url,
  });

  const body = `
    <g transform="translate(0, 20)">
      ${statsSection.svg}
      ${carouselSvg}
    </g>
  `;

  return card.withCSS(totalCss).render(body);
}
