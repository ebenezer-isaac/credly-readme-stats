export {
  fetchBadgePage,
  fetchAllBadges,
  normalizeBadge,
  computeStats,
  getUserBadgeData,
} from "./credlyFetcher.js";
export type { UserBadgeData } from "./credlyFetcher.js";

export {
  fetchImageAsBase64,
  fetchImagesAsBase64,
  hydrateBadgeImages,
} from "./imageFetcher.js";
