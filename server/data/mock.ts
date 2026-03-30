import type { LayoutPayload, NewsItem, ServerStatus } from "../../src/types.js";

export function getMockLayout(): LayoutPayload {
  return {
    siteTitle: "Flux Control Panel",
    currentTheme: "default",
    availableThemes: ["default", "bootstrap"],
    user: null,
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
          { name: "Login", module: "account", action: "login", url: "/account/login" },
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

export function getMockNews(): NewsItem[] {
  return [
    {
      id: 1,
      title: "FluxCP migration started",
      body: "The new React shell mirrors the original theme while business logic moves to Node.js services.",
      author: "admin",
      createdAt: "2026-03-30T10:00:00.000Z"
    },
    {
      id: 2,
      title: "rAthena integration target",
      body: "Server status, account flows, rankings and item data are being split into typed API modules.",
      author: "admin",
      createdAt: "2026-03-29T10:00:00.000Z"
    },
    {
      id: 3,
      title: "Theme parity first",
      body: "The migration keeps the original FluxCP layout, sidebar structure and nostalgic visual treatment.",
      author: "admin",
      createdAt: "2026-03-28T10:00:00.000Z"
    }
  ];
}

export function getMockStatus(): ServerStatus[] {
  return [
    {
      groupName: "FluxRO",
      serverName: "FluxRO",
      loginServerUp: true,
      charServerUp: true,
      mapServerUp: true,
      playersOnline: 128,
      playersPeak: 241
    }
  ];
}
