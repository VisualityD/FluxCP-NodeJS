import type { RowDataPacket } from "mysql2";
import type { GuildCastle, GuildMember, GuildProfile, GuildRelation, InventoryItem } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getCastleName } from "../lib/castles.js";
import { getJobName } from "../lib/jobs.js";
import { getTableColumns } from "../lib/schema.js";

type GuildRow = RowDataPacket & {
  guild_id: number;
  name: string;
  char_id: number;
  guild_lv: number;
  connect_member: number;
  max_member: number;
  average_lv: number;
  exp: number;
  next_exp: number;
  skill_point: number;
  mes1: string | null;
  mes2: string | null;
  emblem: number;
  guild_master: string | null;
};

type GuildRelationRow = RowDataPacket & {
  alliance_id: number;
  name: string | null;
};

type GuildMemberRow = RowDataPacket & {
  account_id: number;
  char_id: number;
  name: string;
  class: number;
  base_level: number;
  job_level: number;
  lastlogin: string;
  devotion: number;
  position: number;
  position_name: string | null;
  mode: number | null;
  guild_tax: number | null;
};

type GuildCastleRow = RowDataPacket & {
  castle_id: number;
};

type GuildStorageRow = RowDataPacket & {
  item_id: number;
  item_name: string | null;
  amount: number;
  identify: number;
  refine: number;
  equip: number;
  card0: number | null;
  card1: number | null;
  card2: number | null;
  card3: number | null;
  bound: number | null;
  expire_time: string | null;
  enchantgrade: number | null;
};

type CardRow = RowDataPacket & {
  id: number;
  name_english: string;
};

function formatRights(mode: number | null): string {
  if (mode === 17) return "Invite/Expel";
  if (mode === 16) return "Expel";
  if (mode === 1) return "Invite";
  if (mode === 0 || mode === null) return "None";
  return "Unknown";
}

function mapRelation(rows: GuildRelationRow[]): GuildRelation[] {
  return rows.map((row) => ({
    guildId: row.alliance_id,
    name: row.name
  }));
}

function mapMembers(rows: GuildMemberRow[]): GuildMember[] {
  return rows.map((row) => ({
    accountId: row.account_id,
    charId: row.char_id,
    name: row.name,
    jobClass: row.class,
    jobName: getJobName(row.class),
    baseLevel: row.base_level,
    jobLevel: row.job_level,
    devotion: Number(row.devotion ?? 0),
    position: row.position,
    positionName: row.position_name,
    rights: formatRights(row.mode),
    tax: Number(row.guild_tax ?? 0),
    lastLogin: row.lastlogin
  }));
}

function mapCastles(rows: GuildCastleRow[]): GuildCastle[] {
  return rows.map((row) => ({
    castleId: row.castle_id,
    name: getCastleName(row.castle_id)
  }));
}

export async function getGuildProfile(guildId: number): Promise<GuildProfile | null> {
  const pool = getPool(runtimeConfig.charDatabase);

  const [guildRows] = await pool.query<GuildRow[]>(
    `SELECT
      guild.guild_id,
      guild.name,
      guild.char_id,
      guild.guild_lv,
      guild.connect_member,
      guild.max_member,
      guild.average_lv,
      guild.exp,
      guild.next_exp,
      guild.skill_point,
      REPLACE(guild.mes1, '|00', '') AS mes1,
      REPLACE(guild.mes2, '|00', '') AS mes2,
      guild.emblem_id AS emblem,
      \`char\`.name AS guild_master
     FROM guild
     LEFT JOIN \`char\` ON \`char\`.char_id = guild.char_id
     WHERE guild.guild_id = ?
     LIMIT 1`,
    [guildId]
  );

  const guild = guildRows[0];
  if (!guild) {
    return null;
  }

  const [allianceRows, oppositionRows, memberRows, castleRows, storageRows] = await Promise.all([
    pool.query<GuildRelationRow[]>(
      `SELECT guild_alliance.alliance_id, guild.name
       FROM guild_alliance
       LEFT JOIN guild ON guild_alliance.alliance_id = guild.guild_id
       WHERE guild_alliance.guild_id = ? AND guild_alliance.opposition = 0
       ORDER BY guild_alliance.alliance_id ASC`,
      [guildId]
    ).then(([rows]) => rows),
    pool.query<GuildRelationRow[]>(
      `SELECT guild_alliance.alliance_id, guild.name
       FROM guild_alliance
       LEFT JOIN guild ON guild_alliance.alliance_id = guild.guild_id
       WHERE guild_alliance.guild_id = ? AND guild_alliance.opposition = 1
       ORDER BY guild_alliance.alliance_id ASC`,
      [guildId]
    ).then(([rows]) => rows),
    pool.query<GuildMemberRow[]>(
      `SELECT
        ch.account_id,
        ch.char_id,
        ch.name,
        ch.class,
        ch.base_level,
        ch.job_level,
        IF(ch.online = 1, 'Online Now!',
          CASE DATE_FORMAT(acc.lastlogin, '%Y-%m-%d')
            WHEN DATE_FORMAT(NOW(), '%Y-%m-%d') THEN 'Today'
            WHEN DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), '%Y-%m-%d') THEN 'Yesterday'
            ELSE CONCAT(DATEDIFF(NOW(), acc.lastlogin), ' Days Ago')
          END
        ) AS lastlogin,
        IFNULL(roster.exp, 0) AS devotion,
        roster.position,
        pos.name AS position_name,
        pos.mode,
        IFNULL(pos.exp_mode, 0) AS guild_tax
       FROM \`char\` AS ch
       LEFT JOIN \`${runtimeConfig.loginDatabase.database}\`.\`login\` AS acc ON acc.account_id = ch.account_id
       LEFT JOIN guild_member AS roster ON roster.guild_id = ch.guild_id AND roster.char_id = ch.char_id
       LEFT JOIN guild_position AS pos ON pos.guild_id = ch.guild_id AND pos.position = roster.position
       WHERE ch.guild_id = ?
       ORDER BY roster.position ASC, acc.lastlogin DESC`,
      [guildId]
    ).then(([rows]) => rows),
    pool.query<GuildCastleRow[]>(
      "SELECT castle_id FROM guild_castle WHERE guild_id = ? ORDER BY castle_id ASC",
      [guildId]
    ).then(([rows]) => rows),
    resolveItemTableName().then(async (itemTable) => {
      if (!itemTable) {
        return [] as GuildStorageRow[];
      }

      return pool
        .query<GuildStorageRow[]>(
          `SELECT items.id AS item_id, items.name_english AS item_name, guild_storage.amount, guild_storage.identify, guild_storage.refine, guild_storage.equip${await buildGuildStorageSelectSuffix()}
           FROM guild_storage
           LEFT JOIN \`${itemTable}\` AS items ON items.name_aegis = guild_storage.nameid OR items.id = guild_storage.nameid
           WHERE guild_storage.guild_id = ?
           ORDER BY guild_storage.nameid ASC`,
          [guildId]
        )
        .then(([rows]) => rows);
    })
  ]);

  return {
    guildId: guild.guild_id,
    name: guild.name,
    leaderCharId: guild.char_id,
    leaderName: guild.guild_master,
    guildLevel: guild.guild_lv,
    onlineMembers: guild.connect_member,
    maxMembers: guild.max_member,
    averageLevel: guild.average_lv,
    experience: guild.exp,
    nextExperience: guild.next_exp,
    skillPoints: guild.skill_point,
    message1: guild.mes1,
    message2: guild.mes2,
    emblemId: guild.emblem,
    alliances: mapRelation(allianceRows),
    oppositions: mapRelation(oppositionRows),
    members: mapMembers(memberRows),
    castles: mapCastles(castleRows),
    storage: await mapGuildStorageItems(storageRows)
  };
}

let cachedItemTableName: string | null | undefined;
let guildStorageSelectSuffix: string | undefined;

async function resolveItemTableName(): Promise<string | null> {
  if (cachedItemTableName !== undefined) {
    return cachedItemTableName;
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = ?
       AND table_name IN ('items', 'item_db_re', 'item_db', 'item_db2_re', 'item_db2')
     ORDER BY FIELD(table_name, 'items', 'item_db_re', 'item_db', 'item_db2_re', 'item_db2')`,
    [runtimeConfig.charDatabase.database]
  );

  cachedItemTableName = rows[0] ? String(rows[0].table_name) : null;
  return cachedItemTableName;
}

async function buildGuildStorageSelectSuffix(): Promise<string> {
  if (guildStorageSelectSuffix !== undefined) {
    return guildStorageSelectSuffix;
  }

  const columns = await getTableColumns(runtimeConfig.charDatabase, "guild_storage");
  const optional = ["card0", "card1", "card2", "card3", "bound", "expire_time", "enchantgrade"];
  guildStorageSelectSuffix = optional
    .map((name) => (columns.has(name) ? `, guild_storage.${name}` : `, NULL AS ${name}`))
    .join("");
  return guildStorageSelectSuffix;
}

async function mapGuildStorageItems(rows: GuildStorageRow[]): Promise<InventoryItem[]> {
  const cardIds = Array.from(
    new Set(
      rows.flatMap((row) => [row.card0, row.card1, row.card2, row.card3]).filter((value): value is number => Number(value) > 0)
    )
  );

  const cardLookup = await resolveCardNames(cardIds);
  return rows.map((row) => ({
    itemId: Number(row.item_id ?? 0),
    name: row.item_name || "Unknown Item",
    amount: Number(row.amount ?? 0),
    identify: Number(row.identify ?? 0) > 0,
    refine: Number(row.refine ?? 0),
    equip: Number(row.equip ?? 0),
    cards: [row.card0, row.card1, row.card2, row.card3]
      .filter((value): value is number => Number(value) > 0)
      .map((value) => cardLookup.get(value) ?? `Card #${value}`),
    broken: false,
    bound: Number(row.bound ?? 0) > 0,
    favorite: false,
    expireTime: row.expire_time ?? null,
    enchantGrade: Number(row.enchantgrade ?? 0)
  }));
}

async function resolveCardNames(cardIds: number[]): Promise<Map<number, string>> {
  if (cardIds.length === 0) {
    return new Map();
  }

  const itemTable = await resolveItemTableName();
  if (!itemTable) {
    return new Map(cardIds.map((id) => [id, `Card #${id}`]));
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const placeholders = cardIds.map(() => "?").join(", ");
  const [rows] = await pool.query<CardRow[]>(
    `SELECT id, name_english FROM \`${itemTable}\` WHERE id IN (${placeholders})`,
    cardIds
  );

  const lookup = new Map(cardIds.map((id) => [id, `Card #${id}`]));
  for (const row of rows) {
    lookup.set(row.id, row.name_english);
  }
  return lookup;
}
