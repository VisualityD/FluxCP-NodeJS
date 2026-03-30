import cors from "cors";
import express from "express";
import { runtimeConfig } from "./config/runtime.js";
import { asyncHandler, normalizeError } from "./lib/http.js";
import { initializeDatabaseConfig } from "./lib/bootstrap.js";
import { loginWithCredentials } from "./services/auth-service.js";
import { getMyAccountProfile } from "./services/account-service.js";
import { getCastleList } from "./services/castle-service.js";
import { getCharacterProfile } from "./services/character-service.js";
import { getGuildProfile } from "./services/guild-service.js";
import { getLayoutPayload } from "./services/layout-service.js";
import { getBuyingStoreList, getBuyingStoreShop, getVendingList, getVendingShop } from "./services/market-service.js";
import { getMonsterProfile, searchMonsters } from "./services/monster-service.js";
import { getItemProfile, searchItems } from "./services/item-service.js";
import { getNewsItems } from "./services/news-service.js";
import { registerAccount } from "./services/register-service.js";
import { getCharacterRanking, getGuildRanking } from "./services/ranking-service.js";
import { getServerInfo } from "./services/server-info-service.js";
import { getServerStatus } from "./services/status-service.js";
import { getWoeSchedule } from "./services/woe-service.js";
import { clearSessionCookie, getSessionUser, setSessionCookie } from "./lib/session.js";
import { getPreferredTheme, normalizeTheme, setPreferredTheme } from "./lib/theme.js";

await initializeDatabaseConfig();

const app = express();
const port = runtimeConfig.port;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, serverName: runtimeConfig.serverName });
});

app.get("/api/layout", (request, response) => {
  response.json(getLayoutPayload(getSessionUser(request), getPreferredTheme(request)));
});

app.post("/api/theme", (request, response) => {
  const theme = normalizeTheme(String(request.body?.theme ?? ""));
  setPreferredTheme(response, theme);
  response.json({ ok: true, theme });
});

app.get("/api/session", (request, response) => {
  const user = getSessionUser(request);
  response.json({
    user
  });
});

app.post("/api/account/login", asyncHandler(async (request, response) => {
  const username = String(request.body?.username ?? "");
  const password = String(request.body?.password ?? "");
  const result = await loginWithCredentials(username, password);

  if (!result.ok) {
    response.status(401).json(result);
    return;
  }

  setSessionCookie(response, result.user);
  response.json({
    ok: true,
    user: result.user
  });
}));

app.post("/api/account/logout", (_request, response) => {
  clearSessionCookie(response);
  response.json({ ok: true });
});

app.post("/api/account/create", asyncHandler(async (request, response) => {
  const result = await registerAccount({
    username: String(request.body?.username ?? ""),
    password: String(request.body?.password ?? ""),
    confirmPassword: String(request.body?.confirmPassword ?? ""),
    email: String(request.body?.email ?? ""),
    confirmEmail: String(request.body?.confirmEmail ?? ""),
    gender: String(request.body?.gender ?? ""),
    birthdate: String(request.body?.birthdate ?? "")
  });

  if (!result.ok) {
    response.status(400).json(result);
    return;
  }

  const loginResult = await loginWithCredentials(result.username, result.passwordForLogin);
  if (loginResult.ok) {
    setSessionCookie(response, loginResult.user);
  }

  response.json({
    ok: true,
    accountId: result.accountId
  });
}));

app.get("/api/account/me", asyncHandler(async (request, response) => {
  const user = getSessionUser(request);
  if (!user) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  const profile = await getMyAccountProfile(user);
  if (!profile) {
    response.status(404).json({ message: "Account not found." });
    return;
  }

  response.json(profile);
}));

app.get("/api/character/:id", asyncHandler(async (request, response) => {
  const user = getSessionUser(request);
  if (!user) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  const characterId = Number(request.params.id);
  if (!Number.isFinite(characterId)) {
    response.status(400).json({ message: "Invalid character id." });
    return;
  }

  const profile = await getCharacterProfile(user, characterId);
  if (!profile) {
    response.status(404).json({ message: "Character not found." });
    return;
  }

  response.json(profile);
}));

app.get("/api/ranking/characters", asyncHandler(async (request, response) => {
  const jobClassValue = request.query.jobClass;
  const jobClass =
    typeof jobClassValue === "string" && jobClassValue.trim() !== ""
      ? Number(jobClassValue)
      : null;

  if (jobClassValue !== undefined && jobClass !== null && !Number.isFinite(jobClass)) {
    response.status(400).json({ message: "Invalid job class." });
    return;
  }

  const ranking = await getCharacterRanking(jobClass);
  response.json(ranking);
}));

app.get("/api/ranking/guilds", asyncHandler(async (_request, response) => {
  const ranking = await getGuildRanking();
  response.json(ranking);
}));

app.get("/api/guild/:id", asyncHandler(async (_request, response) => {
  const guildId = Number(_request.params.id);
  if (!Number.isFinite(guildId)) {
    response.status(400).json({ message: "Invalid guild id." });
    return;
  }

  const guild = await getGuildProfile(guildId);
  if (!guild) {
    response.status(404).json({ message: "Guild not found." });
    return;
  }

  response.json(guild);
}));

app.get("/api/castles", asyncHandler(async (_request, response) => {
  const castles = await getCastleList();
  response.json(castles);
}));

app.get("/api/woe", (_request, response) => {
  response.json(getWoeSchedule());
});

app.get("/api/vending", asyncHandler(async (_request, response) => {
  response.json(await getVendingList());
}));

app.get("/api/vending/:id", asyncHandler(async (request, response) => {
  const shopId = Number(request.params.id);
  if (!Number.isFinite(shopId)) {
    response.status(400).json({ message: "Invalid vending shop id." });
    return;
  }

  const shop = await getVendingShop(shopId);
  if (!shop) {
    response.status(404).json({ message: "Vending shop not found." });
    return;
  }

  response.json(shop);
}));

app.get("/api/buyingstores", asyncHandler(async (_request, response) => {
  response.json(await getBuyingStoreList());
}));

app.get("/api/buyingstores/:id", asyncHandler(async (request, response) => {
  const shopId = Number(request.params.id);
  if (!Number.isFinite(shopId)) {
    response.status(400).json({ message: "Invalid buying store id." });
    return;
  }

  const shop = await getBuyingStoreShop(shopId);
  if (!shop) {
    response.status(404).json({ message: "Buying store not found." });
    return;
  }

  response.json(shop);
}));

app.get("/api/items", asyncHandler(async (request, response) => {
  const itemIdValue = typeof request.query.itemId === "string" ? Number(request.query.itemId) : null;
  const name = typeof request.query.name === "string" ? request.query.name : null;
  const type = typeof request.query.type === "string" ? request.query.type : null;

  if (request.query.itemId !== undefined && (itemIdValue === null || !Number.isFinite(itemIdValue))) {
    response.status(400).json({ message: "Invalid item id." });
    return;
  }

  const items = await searchItems({
    itemId: itemIdValue,
    name,
    type
  });
  response.json(items);
}));

app.get("/api/items/:id", asyncHandler(async (request, response) => {
  const itemId = Number(request.params.id);
  if (!Number.isFinite(itemId)) {
    response.status(400).json({ message: "Invalid item id." });
    return;
  }

  const item = await getItemProfile(itemId);
  if (!item) {
    response.status(404).json({ message: "Item not found." });
    return;
  }

  response.json(item);
}));

app.get("/api/monsters", asyncHandler(async (request, response) => {
  const monsterIdValue = typeof request.query.monsterId === "string" ? Number(request.query.monsterId) : null;
  const name = typeof request.query.name === "string" ? request.query.name : null;
  const mvp = typeof request.query.mvp === "string" ? request.query.mvp : null;

  if (request.query.monsterId !== undefined && (monsterIdValue === null || !Number.isFinite(monsterIdValue))) {
    response.status(400).json({ message: "Invalid monster id." });
    return;
  }

  const monsters = await searchMonsters({
    monsterId: monsterIdValue,
    name,
    mvp
  });
  response.json(monsters);
}));

app.get("/api/monsters/:id", asyncHandler(async (request, response) => {
  const monsterId = Number(request.params.id);
  if (!Number.isFinite(monsterId)) {
    response.status(400).json({ message: "Invalid monster id." });
    return;
  }

  const monster = await getMonsterProfile(monsterId);
  if (!monster) {
    response.status(404).json({ message: "Monster not found." });
    return;
  }

  response.json(monster);
}));

app.get("/api/news", asyncHandler(async (request, response) => {
  const limit = Number(request.query.limit ?? 10);
  const items = await getNewsItems(Number.isFinite(limit) ? limit : 10);
  response.json(items);
}));

app.get("/api/status", asyncHandler(async (_request, response) => {
  const status = await getServerStatus();
  response.json(status);
}));

app.get("/api/server/info", asyncHandler(async (_request, response) => {
  const info = await getServerInfo();
  response.json(info);
}));

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const normalized = normalizeError(error);
  console.error(normalized.logMessage);
  response.status(normalized.status).json({ message: normalized.message });
});

app.listen(port, () => {
  console.log(`FluxCP modern API listening on http://localhost:${port}`);
});
