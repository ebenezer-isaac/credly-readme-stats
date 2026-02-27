/** Skill tag attached to a badge template */
export interface CredlySkill {
  readonly id: string;
  readonly name: string;
  readonly vanity_slug: string;
  readonly canonical: boolean;
  readonly faethm_id?: string;
}

/** Image object nested in badge/template */
export interface CredlyImage {
  readonly id: string;
  readonly url: string;
}

/** Organization entity that issued the badge */
export interface CredlyOrganizationEntity {
  readonly type: "Organization";
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly vanity_url: string;
  readonly internationalize_badge_templates: boolean;
  readonly share_to_ziprecruiter: boolean;
  readonly twitter_url: string | null;
  readonly verified: boolean;
}

/** Issuer entity wrapper */
export interface CredlyIssuerEntity {
  readonly label: string;
  readonly primary: boolean;
  readonly entity: CredlyOrganizationEntity;
}

/** Issuer summary */
export interface CredlyIssuer {
  readonly summary: string;
  readonly entities: readonly CredlyIssuerEntity[];
}

/** Badge template (the "type" of badge) */
export interface CredlyBadgeTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly global_activity_url: string | null;
  readonly earn_this_badge_url: string | null;
  readonly enable_earn_this_badge: boolean;
  readonly enable_detail_attribute_visibility: boolean;
  readonly public: boolean;
  readonly recipient_type: string;
  readonly vanity_slug: string;
  readonly show_badge_lmi: boolean;
  readonly show_skill_tag_links: boolean;
  readonly translatable: boolean;
  readonly level: string | null;
  readonly time_to_earn: string | null;
  readonly cost: string | null;
  readonly type_category: string | null;
  readonly image: CredlyImage;
  readonly image_url: string;
  readonly url: string;
  readonly owner_vanity_slug: string;
  readonly skills: readonly CredlySkill[];
}

/** A single earned badge */
export interface CredlyBadge {
  readonly id: string;
  readonly expires_at_date: string | null;
  readonly issued_at_date: string;
  readonly issued_to: string;
  readonly locale: string;
  readonly public: boolean;
  readonly state: "accepted" | "pending" | "revoked";
  readonly accepted_at: string;
  readonly expires_at: string | null;
  readonly issued_at: string;
  readonly last_updated_at: string;
  readonly updated_at: string;
  readonly earner_path: string;
  readonly earner_photo_url: string | null;
  readonly is_private_badge: boolean;
  readonly user_is_earner: boolean;
  readonly printable: boolean;
  readonly issuer: CredlyIssuer;
  readonly badge_template: CredlyBadgeTemplate;
  readonly image: CredlyImage;
  readonly image_url: string;
  readonly evidence: readonly unknown[];
  readonly recommendations: readonly unknown[];
}

/** Pagination metadata */
export interface CredlyMetadata {
  readonly count: number;
  readonly current_page: number;
  readonly total_count: number;
  readonly total_pages: number;
  readonly per: number;
  readonly previous_page_url: string | null;
  readonly next_page_url: string | null;
}

/** Top-level Credly API response */
export interface CredlyBadgesResponse {
  readonly data: readonly CredlyBadge[];
  readonly metadata: CredlyMetadata;
}
