import type { LayoutPayload } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import type { SessionUser } from "../lib/session.js";
import type { FluxTheme } from "../lib/theme.js";
import { getAvailableThemes } from "../lib/theme.js";

export function getLayoutPayload(user: SessionUser | null, currentTheme: FluxTheme): LayoutPayload {
  return {
    siteTitle: runtimeConfig.siteTitle,
    currentTheme,
    availableThemes: getAvailableThemes(),
    user: user
      ? {
          username: user.username,
          serverName: user.serverName,
          isAdmin: user.groupLevel >= 99
        }
      : null,
    menuSections: [
      {
        title: "Main",
        items: [
          { name: "Home", module: "main", action: "index", url: "/" },
          { name: "News", module: "news", action: "index", url: "/news/index" }
        ]
      },
      {
        title: "Account",
        items: [
          ...(user
            ? [{ name: "My Account", module: "account", action: "view", url: "/account/view" }]
            : [{ name: "Login", module: "account", action: "login", url: "/account/login" }]),
          { name: "Create Account", module: "account", action: "create", url: "/account/create" }
        ]
      },
      {
        title: "Information",
        items: [
          { name: "Server Info", module: "server", action: "info", url: "/server/info" },
          { name: "Server Status", module: "server", action: "status", url: "/server/status" },
          { name: "WoE Hours", module: "woe", action: "index", url: "/woe/index" },
          { name: "Castles", module: "castle", action: "index", url: "/castle/index" },
          { name: "Vendors", module: "vending", action: "index", url: "/vending/index" },
          { name: "Buyers", module: "buyingstore", action: "index", url: "/buyingstore/index" }
        ]
      },
      {
        title: "Ranking",
        items: [
          { name: "Characters", module: "ranking", action: "character", url: "/ranking/character" },
          { name: "Guilds", module: "ranking", action: "guild", url: "/ranking/guild" }
        ]
      },
      {
        title: "Database",
        items: [
          { name: "Items", module: "item", action: "index", url: "/item/index" },
          { name: "Monsters", module: "monster", action: "index", url: "/monster/index" }
        ]
      }
    ]
  };
}
