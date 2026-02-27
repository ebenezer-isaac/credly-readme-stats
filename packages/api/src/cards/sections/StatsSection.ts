import type { BadgeStats, CardColors, SectionResult } from "../../types/card.js";
import { encodeHTML } from "../../common/utils.js";
import { truncateText } from "../../common/textMeasure.js";

// SVG icon paths (16x16 viewBox)
export const STAT_ICONS = {
  badge:
    '<path d="M8 0a3 3 0 00-3 3v2.5a3 3 0 006 0V3a3 3 0 00-3-3zm4.5 7.5a4.5 4.5 0 01-9 0V3a4.5 4.5 0 019 0v4.5zM5 12.5V14h6v-1.5H5zm-2.5 3h11v1.5h-11v-1.5z"/>',
  issuer:
    '<path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v1.25h2.25a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25v12.5zM0 1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.749.749 0 11.832-1.248l1.055.703c.487.325.777.871.777 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.766.766 0 01-.197-.026c-.099.017-.2.026-.303.026h-8.5A1.75 1.75 0 010 14.25V1.75z"/>',
  skill:
    '<path d="M7.5 1.75a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75zm-.25 4.5a.75.75 0 01.75-.75h4.25a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75zm-3.5-1L5.5 7 1.75 10.75 0 9l2-2-2-2 1.75-1.75z"/>',
  calendar:
    '<path d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11zm0-3.75V6h11V3.75a.25.25 0 00-.25-.25H2.75a.25.25 0 00-.25.25z"/>',
  expiring:
    '<path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 3a.75.75 0 01.75.75v3.69l2.28 2.28a.75.75 0 01-1.06 1.06l-2.5-2.5A.75.75 0 017.25 8V3.75A.75.75 0 018 3z"/>',
} as const;

/** All hideable sections — stat rows + footer sections */
export const HIDEABLE_STAT_KEYS = [
  "total",
  "issuers",
  "skills",
  "active",
  "expiring",
  "top_issuers",
  "top_skills",
] as const;

export type HideableStatKey = (typeof HIDEABLE_STAT_KEYS)[number];

interface StatRow {
  readonly key: HideableStatKey;
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}

// Animation timing constants
const ANIM_BASE_DELAY_MS = 450;
const ANIM_STAGGER_MS = 150;

/** Options for the stats section builder */
export interface StatsSectionOptions {
  readonly showIcons: boolean;
  readonly hiddenStats: ReadonlySet<string>;
  readonly lineHeight: number;
  readonly contentWidth: number;
  readonly disableAnimations: boolean;
}

function buildStatRows(stats: BadgeStats): readonly StatRow[] {
  return [
    { key: "total", icon: STAT_ICONS.badge, label: "Total Badges", value: String(stats.totalBadges) },
    { key: "issuers", icon: STAT_ICONS.issuer, label: "Unique Issuers", value: String(stats.uniqueIssuers.length) },
    { key: "skills", icon: STAT_ICONS.skill, label: "Unique Skills", value: String(stats.totalSkills) },
    { key: "active", icon: STAT_ICONS.calendar, label: "Active Badges", value: String(stats.activeBadges) },
    { key: "expiring", icon: STAT_ICONS.expiring, label: "Expiring Soon", value: String(stats.expiringCount) },
  ];
}

/**
 * Build the stats section SVG fragment (stat rows + footer).
 * Returns { svg, css, height } for composition in StatsCard and OverviewCard.
 */
export function buildStatsSection(
  stats: BadgeStats,
  options: StatsSectionOptions,
  colors: CardColors,
): SectionResult {
  const { showIcons, hiddenStats, lineHeight, contentWidth, disableAnimations } = options;
  const textX = showIcons ? 25 : 0;
  const valueX = contentWidth;

  const allRows = buildStatRows(stats);
  const visibleRows = allRows.filter((row) => !hiddenStats.has(row.key));

  const totalContentHeight = visibleRows.length * lineHeight;

  const statRowSvgs = visibleRows.map((row, i) => {
    const y = i * lineHeight;
    const delay = ANIM_BASE_DELAY_MS + i * ANIM_STAGGER_MS;
    const iconSvg = showIcons
      ? `<svg x="0" y="-13" viewBox="0 0 16 16" width="16" height="16" fill="${colors.iconColor}">${row.icon}</svg>`
      : "";

    const animStyle = disableAnimations ? "" : ` style="animation-delay: ${delay}ms"`;

    return `
      <g class="stagger"${animStyle} transform="translate(25, ${y})">
        ${iconSvg}
        <text x="${textX}" y="0" class="stat-label">${encodeHTML(row.label)}:</text>
        <text x="${valueX}" y="0" class="stat-value" text-anchor="end">${encodeHTML(row.value)}</text>
      </g>`;
  });

  // Footer sections
  let footerY = totalContentHeight + 20;
  let footerSvg = "";

  if (!hiddenStats.has("top_issuers") && stats.topIssuers.length > 0) {
    const topIssuersText = stats.topIssuers
      .slice(0, 4)
      .map((i) => `${i.name} (${i.count})`)
      .join(" · ");
    footerSvg += `
      <g transform="translate(25, ${footerY})">
        <line x1="0" y1="-8" x2="${contentWidth}" y2="-8" stroke="${colors.borderColor}" stroke-width="1" stroke-opacity="0.5" />
        <text y="8" class="footer-label">Top Issuers:</text>
        <text y="24" class="footer-value">${encodeHTML(truncateText(topIssuersText, contentWidth - 10, 12))}</text>
      </g>`;
    footerY += 45;
  }

  if (!hiddenStats.has("top_skills") && stats.topSkills.length > 0) {
    const topSkillsText = stats.topSkills
      .slice(0, 5)
      .map((s) => `${s.name} (${s.count})`)
      .join(" · ");
    footerSvg += `
      <g transform="translate(25, ${footerY})">
        <text y="0" class="footer-label">Top Skills:</text>
        <text y="16" class="footer-value">${encodeHTML(truncateText(topSkillsText, contentWidth - 10, 12))}</text>
      </g>`;
    footerY += 40;
  }

  const svg = `
    <g transform="translate(0, 20)">
      ${statRowSvgs.join("")}
      ${footerSvg}
    </g>
  `;

  const css = `
    .stat-label {
      font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .stat-value {
      font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.titleColor};
    }
    .footer-label {
      font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .footer-value {
      font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
  `;

  return { svg, css, height: footerY };
}
