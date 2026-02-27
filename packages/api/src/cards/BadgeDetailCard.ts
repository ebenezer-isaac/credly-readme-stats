import type { NormalizedBadge, BadgeDetailCardOptions } from "../types/card.js";
import { BaseCard, PADDING_X } from "./BaseCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { encodeHTML, clamp, formatDate } from "../common/utils.js";
import { truncateText, wrapTextMultiline } from "../common/textMeasure.js";

const IMAGE_SIZE = 64;
const IMAGE_GAP = 16;
const TEXT_START_X = PADDING_X + IMAGE_SIZE + IMAGE_GAP;

/** Render a single badge detail card SVG */
export function renderBadgeDetailCard(
  badge: NormalizedBadge,
  options: BadgeDetailCardOptions,
): string {
  const colors = getCardColors(options);
  const cardWidth = clamp(options.card_width ?? 400, 300, 600);
  const showDescription = options.show_description !== false;
  const showSkills = options.show_skills !== false;
  const showIssuer = options.show_issuer !== false;
  const maxTextWidth = cardWidth - TEXT_START_X - 25;

  const imageHref = badge.imageBase64 ?? badge.imageUrl;

  // Calculate dynamic height
  let contentHeight = IMAGE_SIZE; // minimum: image height
  let textY = 20; // first line relative to content start

  const nameText = truncateText(badge.name, maxTextWidth, 16);
  textY += 18; // name line

  if (showIssuer) {
    textY += 16;
  }

  textY += 16; // issued date
  const afterImageY = IMAGE_SIZE + 20;
  let belowImageY = Math.max(textY, afterImageY);

  if (showSkills && badge.skills.length > 0) {
    belowImageY += 16;
    contentHeight = belowImageY;
  }

  if (showDescription && badge.description) {
    const lines = wrapTextMultiline(badge.description, cardWidth - 50, 11, 3);
    belowImageY += lines.length * 14 + 8;
    contentHeight = belowImageY;
  }

  contentHeight = Math.max(contentHeight, belowImageY);
  const titleHeight = options.hide_title ? 35 : 55;
  const cardHeight = titleHeight + contentHeight + 25;

  // Build card body
  let body = `
    <g transform="translate(25, 5)">
      <image href="${encodeHTML(imageHref)}" x="0" y="0" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" />
      <text x="${TEXT_START_X - 25}" y="20" class="badge-name">${encodeHTML(nameText)}</text>`;

  let lineY = 20;

  if (showIssuer) {
    lineY += 18;
    body += `
      <text x="${TEXT_START_X - 25}" y="${lineY}" class="badge-issuer">by ${encodeHTML(badge.issuerName)}</text>`;
  }

  lineY += 18;
  body += `
      <text x="${TEXT_START_X - 25}" y="${lineY}" class="badge-date">Issued: ${encodeHTML(formatDate(badge.issuedDate))}</text>`;

  if (badge.expiresDate) {
    lineY += 14;
    body += `
      <text x="${TEXT_START_X - 25}" y="${lineY}" class="badge-date">Expires: ${encodeHTML(formatDate(badge.expiresDate))}</text>`;
  }

  let belowY = Math.max(lineY + 10, IMAGE_SIZE + 10);

  if (showSkills && badge.skills.length > 0) {
    belowY += 8;
    const skillsText = truncateText(badge.skills.join(" · "), cardWidth - 55, 11);
    body += `
      <text x="0" y="${belowY}" class="badge-skills">${encodeHTML(skillsText)}</text>`;
    belowY += 14;
  }

  if (showDescription && badge.description) {
    const lines = wrapTextMultiline(badge.description, cardWidth - 55, 11, 3);
    for (const line of lines) {
      belowY += 14;
      body += `
      <text x="0" y="${belowY}" class="badge-desc">${encodeHTML(line)}</text>`;
    }
  }

  body += `
    </g>`;

  const title = options.custom_title ?? badge.name;

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
    a11yTitle: badge.name,
    a11yDesc: `${badge.name} by ${badge.issuerName}, issued ${formatDate(badge.issuedDate)}`,
  });

  const css = `
    .badge-name {
      font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.titleColor};
    }
    .badge-issuer {
      font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.textColor};
    }
    .badge-date {
      font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
    .badge-skills {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.iconColor};
    }
    .badge-desc {
      font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${colors.badgeLabelColor};
    }
  `;

  return card.withCSS(css).render(body);
}
