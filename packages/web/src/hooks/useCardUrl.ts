import { useMemo } from "react";
import { DEFAULT_STATE, type BuilderState } from "../constants/defaults";
import { API_BASE, EMBED_BASE } from "../constants/config";

export function useCardUrl(state: BuilderState): string {
  return useMemo(() => {
    if (!state.username.trim()) return "";

    const params = new URLSearchParams();
    params.set("username", state.username.trim());

    // Common params — only include non-default values
    if (state.theme !== "default") params.set("theme", state.theme);
    if (state.title_color) params.set("title_color", state.title_color);
    if (state.text_color) params.set("text_color", state.text_color);
    if (state.icon_color) params.set("icon_color", state.icon_color);
    if (state.bg_color) params.set("bg_color", state.bg_color);
    if (state.border_color) params.set("border_color", state.border_color);
    if (state.hide_border) params.set("hide_border", "true");
    if (state.hide_title) params.set("hide_title", "true");
    if (state.custom_title) params.set("custom_title", state.custom_title);
    if (state.disable_animations) params.set("disable_animations", "true");

    // Card-type-specific params
    switch (state.cardType) {
      case "stats":
        if (!state.show_icons) params.set("show_icons", "false");
        if (state.hide) params.set("hide", state.hide);
        if (state.card_width !== DEFAULT_STATE.card_width) params.set("card_width", String(state.card_width));
        if (state.line_height !== DEFAULT_STATE.line_height) params.set("line_height", String(state.line_height));
        break;
      case "grid":
        if (state.columns !== DEFAULT_STATE.columns) params.set("columns", String(state.columns));
        if (state.rows !== DEFAULT_STATE.rows) params.set("rows", String(state.rows));
        if (state.badge_size !== DEFAULT_STATE.badge_size) params.set("badge_size", String(state.badge_size));
        if (!state.show_name) params.set("show_name", "false");
        if (state.show_issuer) params.set("show_issuer", "true");
        if (state.sort !== "recent") params.set("sort", state.sort);
        break;
      case "timeline":
        if (state.max_items !== DEFAULT_STATE.max_items) params.set("max_items", String(state.max_items));
        if (state.show_description) params.set("show_description", "true");
        if (!state.show_skills) params.set("show_skills", "false");
        if (state.sort !== "recent") params.set("sort", state.sort);
        break;
      case "carousel":
        if (state.visible_count !== DEFAULT_STATE.visible_count) params.set("visible_count", String(state.visible_count));
        if (state.badge_size !== DEFAULT_STATE.badge_size) params.set("badge_size", String(state.badge_size));
        if (!state.show_name) params.set("show_name", "false");
        if (state.show_issuer) params.set("show_issuer", "true");
        if (state.interval !== DEFAULT_STATE.interval) params.set("interval", String(state.interval));
        if (state.sort !== "recent") params.set("sort", state.sort);
        if (state.filter_issuer) params.set("filter_issuer", state.filter_issuer);
        if (state.filter_skill) params.set("filter_skill", state.filter_skill);
        if (state.max_items !== DEFAULT_STATE.max_items) params.set("max_items", String(state.max_items));
        if (state.card_width !== DEFAULT_STATE.card_width) params.set("card_width", String(state.card_width));
        break;
      case "overview":
        if (!state.show_icons) params.set("show_icons", "false");
        if (state.hide) params.set("hide", state.hide);
        if (state.line_height !== DEFAULT_STATE.line_height) params.set("line_height", String(state.line_height));
        if (state.visible_count !== DEFAULT_STATE.visible_count) params.set("visible_count", String(state.visible_count));
        if (state.badge_size !== DEFAULT_STATE.badge_size) params.set("badge_size", String(state.badge_size));
        if (!state.show_name) params.set("show_name", "false");
        if (state.show_issuer) params.set("show_issuer", "true");
        if (state.interval !== DEFAULT_STATE.interval) params.set("interval", String(state.interval));
        if (state.sort !== "recent") params.set("sort", state.sort);
        if (state.filter_issuer) params.set("filter_issuer", state.filter_issuer);
        if (state.filter_skill) params.set("filter_skill", state.filter_skill);
        if (state.max_items !== DEFAULT_STATE.max_items) params.set("max_items", String(state.max_items));
        if (state.card_width !== DEFAULT_STATE.card_width) params.set("card_width", String(state.card_width));
        break;
    }

    return `${API_BASE}/api/${state.cardType}?${params.toString()}`;
  }, [state]);
}

export function useEmbedCode(url: string, state: BuilderState): { markdown: string; html: string } {
  return useMemo(() => {
    if (!url) return { markdown: "", html: "" };
    // Embed code always uses the absolute public URL so it works in GitHub READMEs
    const embedUrl = url.replace(API_BASE, EMBED_BASE);
    const alt = state.custom_title || `${state.username}'s Credly ${state.cardType} card`;
    return {
      markdown: `![${alt}](${embedUrl})`,
      html: `<img src="${embedUrl}" alt="${alt}" />`,
    };
  }, [url, state.username, state.custom_title, state.cardType]);
}
