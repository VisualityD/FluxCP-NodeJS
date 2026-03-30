import type { Request, Response } from "express";
import { getCookieValue } from "./session.js";

export const AVAILABLE_THEMES = ["default", "bootstrap"] as const;
export type FluxTheme = (typeof AVAILABLE_THEMES)[number];

const DEFAULT_THEME: FluxTheme = "default";
const COOKIE_NAME = "fluxcp_theme";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export function normalizeTheme(value: string | undefined | null): FluxTheme {
  return AVAILABLE_THEMES.includes(value as FluxTheme) ? (value as FluxTheme) : DEFAULT_THEME;
}

export function getPreferredTheme(request: Request): FluxTheme {
  return normalizeTheme(getCookieValue(request, COOKIE_NAME));
}

export function setPreferredTheme(response: Response, theme: FluxTheme): void {
  response.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(theme)}; Path=/; SameSite=Lax; Max-Age=${THIRTY_DAYS_IN_SECONDS}`
  );
}

export function getAvailableThemes(): FluxTheme[] {
  return [...AVAILABLE_THEMES];
}
