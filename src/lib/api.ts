import type {
  AccountProfile,
  BuyingStore,
  BuyingStoreSummary,
  CastleInfo,
  CharacterProfile,
  CharacterRankingEntry,
  GuildProfile,
  GuildRankingEntry,
  ItemListEntry,
  ItemProfile,
  LayoutPayload,
  MonsterListEntry,
  MonsterProfile,
  NewsItem,
  ServerInfo,
  ServerStatus,
  SessionUser,
  VendingShop,
  VendingSummary,
  WoeSchedule
} from "../types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : `Request failed for ${path}`;
    throw new Error(message);
  }

  return payload as T;
}

async function sendJson<T>(path: string, method: "POST", body?: object): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((payload as { message?: string }).message || `Request failed for ${path}`);
  }

  return payload;
}

export const api = {
  getLayout: () => getJson<LayoutPayload>("/api/layout"),
  getNews: () => getJson<NewsItem[]>("/api/news"),
  getStatus: () => getJson<ServerStatus[]>("/api/status"),
  getServerInfo: () => getJson<ServerInfo>("/api/server/info"),
  getCastles: () => getJson<CastleInfo[]>("/api/castles"),
  getWoeSchedule: () => getJson<WoeSchedule[]>("/api/woe"),
  getVendingList: () => getJson<VendingSummary[]>("/api/vending"),
  getVendingShop: (shopId: number) => getJson<VendingShop>(`/api/vending/${shopId}`),
  getBuyingStoreList: () => getJson<BuyingStoreSummary[]>("/api/buyingstores"),
  getBuyingStoreShop: (shopId: number) => getJson<BuyingStore>(`/api/buyingstores/${shopId}`),
  getSession: () => getJson<{ user: SessionUser | null }>("/api/session"),
  getMyAccount: () => getJson<AccountProfile>("/api/account/me"),
  getCharacter: (characterId: number) => getJson<CharacterProfile>(`/api/character/${characterId}`),
  getGuild: (guildId: number) => getJson<GuildProfile>(`/api/guild/${guildId}`),
  searchItems: (query: { itemId?: number | null; name?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (typeof query.itemId === "number") params.set("itemId", String(query.itemId));
    if (query.name) params.set("name", query.name);
    if (query.type) params.set("type", query.type);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return getJson<ItemListEntry[]>(`/api/items${suffix}`);
  },
  getItem: (itemId: number) => getJson<ItemProfile>(`/api/items/${itemId}`),
  searchMonsters: (query: { monsterId?: number | null; name?: string; mvp?: string }) => {
    const params = new URLSearchParams();
    if (typeof query.monsterId === "number") params.set("monsterId", String(query.monsterId));
    if (query.name) params.set("name", query.name);
    if (query.mvp) params.set("mvp", query.mvp);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return getJson<MonsterListEntry[]>(`/api/monsters${suffix}`);
  },
  getMonster: (monsterId: number) => getJson<MonsterProfile>(`/api/monsters/${monsterId}`),
  getCharacterRanking: (jobClass?: number | null) =>
    getJson<CharacterRankingEntry[]>(
      `/api/ranking/characters${typeof jobClass === "number" ? `?jobClass=${jobClass}` : ""}`
    ),
  getGuildRanking: () => getJson<GuildRankingEntry[]>("/api/ranking/guilds"),
  setTheme: (theme: "default" | "bootstrap") =>
    sendJson<{ ok: true; theme: "default" | "bootstrap" }>("/api/theme", "POST", { theme }),
  login: (username: string, password: string) =>
    sendJson<{ ok: true; user: SessionUser }>("/api/account/login", "POST", { username, password }),
  register: (payload: {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    confirmEmail: string;
    gender: string;
    birthdate: string;
  }) => sendJson<{ ok: true; accountId: number }>("/api/account/create", "POST", payload),
  logout: () => sendJson<{ ok: true }>("/api/account/logout", "POST")
};
