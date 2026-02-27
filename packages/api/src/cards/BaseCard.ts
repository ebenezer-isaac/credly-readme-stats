import type { BaseCardConfig, CardColors } from "../types/card.js";
import { encodeHTML, encodeAttr } from "../common/utils.js";
import { measureText, truncateText } from "../common/textMeasure.js";

export const PADDING_X = 25;

/**
 * Base SVG card class. Wraps card body in consistent SVG envelope
 * with background, border, title, animations, and accessibility.
 *
 * Immutable — use withCSS() to produce a new instance with custom CSS.
 */
export class BaseCard {
  readonly width: number;
  readonly height: number;
  private readonly borderRadius: number;
  private readonly colors: CardColors;
  private readonly title: string;
  private readonly titlePrefixIcon: string | undefined;
  private readonly hideBorder: boolean;
  private readonly hideTitle: boolean;
  private readonly disableAnimations: boolean;
  private readonly a11yTitle: string;
  private readonly a11yDesc: string;
  private readonly titleUrl: string | undefined;
  private readonly css: string;

  constructor(config: BaseCardConfig, css = "") {
    this.width = config.width;
    this.height = config.height;
    this.borderRadius = config.borderRadius ?? 4.5;
    this.colors = config.colors;
    this.title = config.customTitle ?? config.defaultTitle ?? "";
    this.titlePrefixIcon = config.titlePrefixIcon;
    this.hideBorder = config.hideBorder ?? false;
    this.hideTitle = config.hideTitle ?? false;
    this.disableAnimations = config.disableAnimations ?? false;
    this.a11yTitle = config.a11yTitle ?? this.title;
    this.a11yDesc = config.a11yDesc ?? "";
    this.titleUrl = config.titleUrl;
    this.css = css;
  }

  /** Produce a new BaseCard with additional CSS injected */
  withCSS(css: string): BaseCard {
    return new BaseCard(
      {
        width: this.width,
        height: this.height,
        borderRadius: this.borderRadius,
        colors: this.colors,
        customTitle: this.title,
        titlePrefixIcon: this.titlePrefixIcon,
        hideBorder: this.hideBorder,
        hideTitle: this.hideTitle,
        disableAnimations: this.disableAnimations,
        a11yTitle: this.a11yTitle,
        a11yDesc: this.a11yDesc,
        titleUrl: this.titleUrl,
      },
      css,
    );
  }

  /**
   * Compute title SVG and any extra CSS needed (e.g. marquee animation).
   * Returns { svg, css } to keep render() pure.
   */
  private computeTitle(): { readonly svg: string; readonly css: string } {
    if (this.hideTitle) return { svg: "", css: "" };

    const iconSvg = this.titlePrefixIcon
      ? `<svg class="icon" x="0" y="-13" viewBox="0 0 16 16" width="16" height="16" fill="${this.colors.iconColor}">${this.titlePrefixIcon}</svg>`
      : "";

    const textX = this.titlePrefixIcon ? 25 : 0;
    const maxTitleWidth = this.width - PADDING_X * 2 - textX;
    const titleWidth = measureText(this.title, 18, true);
    const overflows = titleWidth > maxTitleWidth;

    const wrapLink = (inner: string): string =>
      this.titleUrl
        ? `<a href="${encodeAttr(this.titleUrl)}" target="_blank" class="title-link">${inner}</a>`
        : inner;

    // Marquee: scroll long titles back and forth with pauses
    if (overflows && !this.disableAnimations) {
      const overflow = titleWidth - maxTitleWidth + 10; // 10px extra breathing room
      const duration = Math.max(5, Math.min(10, overflow / 15));
      const clipId = "title-clip";

      const titleContent = `
      <g data-testid="card-title" transform="translate(${PADDING_X}, 35)">
        ${iconSvg}
        <defs>
          <clipPath id="${clipId}">
            <rect x="${textX}" y="-18" width="${maxTitleWidth}" height="26" />
          </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
          <text x="${textX}" y="0" class="header marquee-title" data-testid="header">${encodeHTML(this.title)}</text>
        </g>
      </g>`;

      const css = `
      @keyframes titleMarquee {
        0%, 20% { transform: translateX(0); }
        45%, 55% { transform: translateX(-${overflow.toFixed(1)}px); }
        80%, 100% { transform: translateX(0); }
      }
      .marquee-title {
        animation: titleMarquee ${duration.toFixed(1)}s ease-in-out infinite;
      }
      ${this.titleUrl ? ".title-link { cursor: pointer; }" : ""}`;

      return { svg: wrapLink(titleContent), css };
    }

    // Fallback: truncate if animations are disabled
    const displayTitle = overflows
      ? truncateText(this.title, maxTitleWidth, 18, true)
      : this.title;

    const titleContent = `
      <g data-testid="card-title" transform="translate(${PADDING_X}, 35)">
        ${iconSvg}
        <text x="${textX}" y="0" class="header" data-testid="header">${encodeHTML(displayTitle)}</text>
      </g>`;

    const titleCss = this.titleUrl ? ".title-link { cursor: pointer; }" : "";
    return { svg: wrapLink(titleContent), css: titleCss };
  }

  private renderGradient(): string {
    const bg = this.colors.bgColor;
    if (typeof bg === "string") return "";

    const [angle, ...colors] = bg;
    if (!angle || colors.length === 0) return "";

    const stops = colors
      .map((color, i) => {
        const offset = colors.length === 1 ? 0 : (i / (colors.length - 1)) * 100;
        return `<stop offset="${offset}%" stop-color="${color}" />`;
      })
      .join("\n        ");

    return `
      <defs>
        <linearGradient id="gradient" gradientTransform="rotate(${angle})" gradientUnits="userSpaceOnUse">
          ${stops}
        </linearGradient>
      </defs>
    `;
  }

  private renderAnimations(): string {
    if (this.disableAnimations) return "";

    return `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .fade-in { animation: fadeIn 0.3s ease-in forwards; }
      .scale-in { animation: scaleIn 0.3s ease-in forwards; }
      .stagger { opacity: 0; animation: fadeIn 0.3s ease-in forwards; }
    `;
  }

  /** Render complete SVG wrapping the body content */
  render(body: string): string {
    const bgFill =
      typeof this.colors.bgColor === "string" ? this.colors.bgColor : "url(#gradient)";

    const bodyY = this.hideTitle ? 35 : 55;
    const titleInfo = this.computeTitle();

    return `
<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="descId">
  <title id="titleId">${encodeHTML(this.a11yTitle)}</title>
  <desc id="descId">${encodeHTML(this.a11yDesc)}</desc>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${this.colors.titleColor};
      animation: fadeIn 0.8s ease-in-out forwards;
    }
    @supports(-moz-appearance: auto) {
      .header { font-size: 15.5px; }
    }
    ${this.renderAnimations()}
    ${titleInfo.css}
    ${this.css}
  </style>

  ${this.renderGradient()}

  <rect data-testid="card-bg" x="0.5" y="0.5" rx="${this.borderRadius}" height="99%" width="${this.width - 1}" fill="${bgFill}" stroke="${this.colors.borderColor}" stroke-opacity="${this.hideBorder ? 0 : 1}" />

  ${titleInfo.svg}

  <g data-testid="main-card-body" transform="translate(0, ${bodyY})">
    ${body}
  </g>
</svg>`.trim();
  }
}
