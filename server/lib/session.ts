import crypto from "node:crypto";
import type { Request, Response } from "express";
import { runtimeConfig } from "../config/runtime.js";

const COOKIE_NAME = "fluxcp_session";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  accountId: number;
  username: string;
  groupId: number;
  groupLevel: number;
  serverName: string;
  loginDate: string;
};

function sign(payload: string): string {
  return crypto.createHmac("sha256", runtimeConfig.sessionSecret).update(payload).digest("hex");
}

export function serializeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseSessionToken(token: string | undefined): SessionUser | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export function getCookieValue(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) {
    return undefined;
  }

  const pairs = header.split(";").map((part) => part.trim());
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = pair.slice(0, separatorIndex);
    const value = pair.slice(separatorIndex + 1);
    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return undefined;
}

export function getSessionUser(request: Request): SessionUser | null {
  return parseSessionToken(getCookieValue(request, COOKIE_NAME));
}

export function setSessionCookie(response: Response, user: SessionUser): void {
  const token = encodeURIComponent(serializeSession(user));
  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${THIRTY_DAYS_IN_SECONDS}`
  );
}

export function clearSessionCookie(response: Response): void {
  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
