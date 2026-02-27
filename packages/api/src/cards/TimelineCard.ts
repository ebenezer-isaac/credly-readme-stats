import type { NormalizedBadge, TimelineCardOptions } from "../types/card.js";
import { BaseCard, PADDING_X } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { encodeHTML, clamp, formatDate } from "../common/utils.js";
import { truncateText } from "../common/textMeasure.js";
import { sortBadges, filterBadges } from "../common/badgeFilters.js";

const SPINE_X = 33;
const CONTENT_X = 50;
const NODE_RADIUS = 6;
const ENTRY_BASE_HEIGHT = 45;
const SKILLS_HEIGHT = 16;
const DESCRIPTION_LINE_HEIGHT = 16;
const ENTRY_GAP = 14;

/** Render the Timeline Card SVG */
export function renderTimelineCard(
  badges: readonly NormalizedBadge[],
  options: TimelineCardOptions,
): string {
  const colors = getCardColors(options);
  const maxItems = clamp(options.max_items ?? 6, 1, 20);
  const showDescription = options.show_description ?? false;
  const showSkills = options.show_skills !== false;
  const cardWidth = clamp(options.card_width ?? 495, 400, 800);
  const maxTextWidth = cardWidth - CONTENT_X - PADDING_X;

  // Filter and sort
  const filtered = filterBadges(badges, options.filter_issuer, options.filter_skill);
  const sorted = sortBadges(filtered, options.sort);
  const displayBadges = sorted.slice(0, maxItems);

  // Calculate entry heights and total
  const entryHeights = displayBadges.map((badge) => {
    let height = ENTRY_BASE_HEIGHT;
    if (showSkills && badge.skills.length > 0) height += SKILLS_HEIGHT;
    if (showDescription) height += DESCRIPTION_LINE_HEIGHT * 2;
    return height;
  });

  const totalContentHeight = entryHeights.reduce(
    (sum, h, i) => sum + h + (i < entryHeights.length - 1 ? ENTRY_GAP : 0),
    0,
  );

  const titleHeight = options.hide_title ? 35 : 55;
  const cardHeight = titleHeight + totalContentHeight + 30;

  // Pre-compute Y offsets for each entry (functional — no mutation in map)
  const INITIAL_Y = 10;
  const entryYOffsets = entryHeights.reduce<readonly number[]>((offsets, _h, i) => {
    if (i === 0) return [INITIAL_Y];
    const prevY = offsets[i - 1] ?? INITIAL_Y;
    const prevHeight = entryHeights[i - 1] ?? ENTRY_BASE_HEIGHT;
    return [...offsets, prevY + prevHeight + ENTRY_GAP];
  }, []);

  // Build timeline entries
  const entries = displayBadges
    .map((badge, i) => {
      const y = entryYOffsets[i] ?? INITIAL_Y;
      const delay = 600 + i * 200;

      const dateText = formatDate(badge.issuedDate);
      const nameText = truncateText(badge.name, maxTextWidth, 14);
      const issuerText = truncateText(`by ${badge.issuerName}`, maxTextWidth, 12);

      let entrySvg = `
      <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(0, ${y})">
        <circle cx="${SPINE_X}" cy="0" r="${NODE_RADIUS}" fill="${colors.iconColor}" />
        <text x="${CONTENT_X}" y="4" class="timeline-date">${encodeHTML(dateText)}</text>
        <text x="${CONTENT_X}" y="22" class="timeline-name">${encodeHTML(nameText)}</text>
        <text x="${CONTENT_X}" y="38" class="timeline-issuer">${encodeHTML(issuerText)}</text>`;

      let extraY = 38;

      if (showSkills && badge.skills.length > 0) {
        extraY += SKILLS_HEIGHT;
        const skillsText = truncateText(badge.skills.join(" · "), maxTextWidth, 11);
        entrySvg += `
        <text x="${CONTENT_X}" y="${extraY}" class="timeline-skills">${encodeHTML(skillsText)}</text>`;
      }

      if (showDescription && badge.description) {
        extraY += DESCRIPTION_LINE_HEIGHT;
        const descText = truncateText(badge.description, maxTextWidth, 11);
        entrySvg += `
        <text x="${CONTENT_X}" y="${extraY}" class="timeline-desc">${encodeHTML(descText)}</text>`;
      }

      entrySvg += `\n      </g>`;
      return entrySvg;
    })
    .join("");

  // Timeline spine line
  const lastEntryY = entryYOffsets[entryYOffsets.length - 1] ?? INITIAL_Y;
  const lastEntryHeight = entryHeights[entryHeights.length - 1] ?? ENTRY_BASE_HEIGHT;
  const spineEndY = lastEntryY + lastEntryHeight;
  const spineSvg =
    displayBadges.length > 1
      ? `<line x1="${SPINE_X}" y1="10" x2="${SPINE_X}" y2="${spineEndY}" stroke="${colors.iconColor}" stroke-width="2" stroke-opacity="0.3" />`
      : "";

  const title = options.custom_title ?? `${options.username}'s Badge Timeline`;

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
    a11yDesc: `Timeline showing ${displayBadges.length} badges`,
  });

  const css = `
    .timeline-date {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
    .timeline-name {
      font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.titleColor};
    }
    .timeline-issuer {
      font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .timeline-skills {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
    .timeline-desc {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
  `;

  const body = `
    ${spineSvg}
    ${entries}
  `;

  return card.withCSS(css).render(body);
}
