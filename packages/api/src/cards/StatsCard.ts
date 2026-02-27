import type { BadgeStats, StatsCardOptions } from "../types/card.js";
import { BaseCard } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { parseArray, clamp } from "../common/utils.js";
import { buildStatsSection, STAT_ICONS } from "./sections/index.js";

// Layout defaults
const DEFAULT_LINE_HEIGHT = 25;
const MIN_LINE_HEIGHT = 20;
const MAX_LINE_HEIGHT = 40;
const DEFAULT_CARD_WIDTH = 495;
const MIN_CARD_WIDTH = 300;
const MAX_CARD_WIDTH = 800;

/** Render the Stats Card SVG */
export function renderStatsCard(stats: BadgeStats, options: StatsCardOptions): string {
  const colors = getCardColors(options);
  const hiddenStats = new Set(parseArray(options.hide));
  const showIcons = options.show_icons !== false;
  const lineHeight = clamp(options.line_height ?? DEFAULT_LINE_HEIGHT, MIN_LINE_HEIGHT, MAX_LINE_HEIGHT);
  const cardWidth = clamp(options.card_width ?? DEFAULT_CARD_WIDTH, MIN_CARD_WIDTH, MAX_CARD_WIDTH);

  const section = buildStatsSection(stats, {
    showIcons,
    hiddenStats,
    lineHeight,
    contentWidth: cardWidth - 50,
    disableAnimations: options.disable_animations ?? false,
  }, colors);

  const cardHeight = 55 + section.height + 15;
  const title = options.custom_title ?? `${options.username}'s Credly Stats`;

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
    a11yDesc: `Credly stats: ${stats.totalBadges} badges, ${stats.uniqueIssuers.length} issuers, ${stats.totalSkills} skills`,
    titleUrl: options.profile_url,
  });

  return card.withCSS(section.css).render(section.svg);
}
