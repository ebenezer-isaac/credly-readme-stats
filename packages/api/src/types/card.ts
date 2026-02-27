/** Colors resolved for card rendering */
export interface CardColors {
  readonly titleColor: string;
  readonly textColor: string;
  readonly iconColor: string;
  readonly bgColor: string | readonly string[];
  readonly borderColor: string;
  readonly badgeLabelColor: string;
}

/** Base options shared by all card types */
export interface BaseCardOptions {
  readonly username: string;
  readonly theme?: string;
  readonly title_color?: string;
  readonly text_color?: string;
  readonly icon_color?: string;
  readonly bg_color?: string;
  readonly border_color?: string;
  readonly badge_label_color?: string;
  readonly hide_border?: boolean;
  readonly hide_title?: boolean;
  readonly custom_title?: string;
  readonly border_radius?: number;
  readonly disable_animations?: boolean;
  readonly cache_seconds?: number;
  readonly profile_url?: string;
}

/** Stats card specific options */
export interface StatsCardOptions extends BaseCardOptions {
  readonly show_icons?: boolean;
  readonly hide?: string;
  readonly card_width?: number;
  readonly line_height?: number;
}

/** Grid card specific options */
export interface GridCardOptions extends BaseCardOptions {
  readonly columns?: number;
  readonly rows?: number;
  readonly badge_size?: number;
  readonly show_name?: boolean;
  readonly show_issuer?: boolean;
  readonly sort?: "recent" | "oldest" | "name" | "issuer";
  readonly filter_issuer?: string;
  readonly filter_skill?: string;
  readonly card_width?: number;
  readonly page?: number;
}

/** Timeline card specific options */
export interface TimelineCardOptions extends BaseCardOptions {
  readonly max_items?: number;
  readonly show_description?: boolean;
  readonly show_skills?: boolean;
  readonly sort?: "recent" | "oldest";
  readonly filter_issuer?: string;
  readonly filter_skill?: string;
  readonly card_width?: number;
}

/** Single badge detail card options */
export interface BadgeDetailCardOptions extends BaseCardOptions {
  readonly badge_id: string;
  readonly show_description?: boolean;
  readonly show_skills?: boolean;
  readonly show_issuer?: boolean;
  readonly card_width?: number;
}

/** Normalized badge data for card rendering */
export interface NormalizedBadge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly imageBase64: string | null;
  readonly issuerName: string;
  readonly issuedDate: string;
  readonly expiresDate: string | null;
  readonly skills: readonly string[];
  readonly level: string | null;
  readonly credlyUrl: string;
}

/** Stats computed from badge collection */
export interface BadgeStats {
  readonly totalBadges: number;
  readonly uniqueIssuers: readonly string[];
  readonly totalSkills: number;
  readonly uniqueSkills: readonly string[];
  readonly activeBadges: number;
  readonly expiringCount: number;
  readonly badgesByYear: ReadonlyMap<number, number>;
  readonly topIssuers: readonly { readonly name: string; readonly count: number }[];
  readonly topSkills: readonly { readonly name: string; readonly count: number }[];
}

/** Result of building a reusable card section */
export interface SectionResult {
  readonly svg: string;
  readonly css: string;
  readonly height: number;
}

/** Carousel card specific options */
export interface CarouselCardOptions extends BaseCardOptions {
  readonly visible_count?: number;
  readonly badge_size?: number;
  readonly show_name?: boolean;
  readonly show_issuer?: boolean;
  readonly interval?: number;
  readonly sort?: "recent" | "oldest" | "name" | "issuer";
  readonly filter_issuer?: string;
  readonly filter_skill?: string;
  readonly card_width?: number;
  readonly max_items?: number;
}

/** Combined stats + carousel card options */
export interface OverviewCardOptions extends BaseCardOptions {
  readonly show_icons?: boolean;
  readonly hide?: string;
  readonly line_height?: number;
  readonly visible_count?: number;
  readonly badge_size?: number;
  readonly show_name?: boolean;
  readonly show_issuer?: boolean;
  readonly interval?: number;
  readonly sort?: "recent" | "oldest" | "name" | "issuer";
  readonly filter_issuer?: string;
  readonly filter_skill?: string;
  readonly max_items?: number;
  readonly card_width?: number;
}

/** BaseCard constructor config */
export interface BaseCardConfig {
  readonly width: number;
  readonly height: number;
  readonly borderRadius?: number;
  readonly colors: CardColors;
  readonly customTitle?: string;
  readonly defaultTitle?: string;
  readonly titlePrefixIcon?: string;
  readonly hideBorder?: boolean;
  readonly hideTitle?: boolean;
  readonly disableAnimations?: boolean;
  readonly a11yTitle?: string;
  readonly a11yDesc?: string;
  readonly titleUrl?: string;
}
