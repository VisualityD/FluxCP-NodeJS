import type { RowDataPacket } from "mysql2";
import type { CharacterProfile, CharacterSummary, InventoryItem } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getJobName } from "../lib/jobs.js";
import { getTableColumns } from "../lib/schema.js";
import type { SessionUser } from "../lib/session.js";

type CharacterRow = RowDataPacket & {
  char_id: number;
  account_id: number;
  char_num: number;
  char_name: string;
  char_class: number;
  char_base_level: number;
  char_job_level: number;
  char_base_exp: number;
  char_job_exp: number;
  char_zeny: number;
  char_str: number;
  char_agi: number;
  char_vit: number;
  char_int: number;
  char_dex: number;
  char_luk: number;
  char_hp: number;
  char_max_hp: number;
  char_sp: number;
  char_max_sp: number;
  char_status_point: number;
  char_skill_point: number;
  char_online: number;
  char_party_id: number;
  userid: string;
  gender: string;
  partner_name: string | null;
  mother_name: string | null;
  father_name: string | null;
  child_name: string | null;
  guild_id: number | null;
  guild_name: string | null;
  guild_position: string | null;
  guild_tax: number | null;
  party_name: string | null;
  party_leader_name: string | null;
  homun_name: string | null;
  homun_class: number | null;
  pet_name: string | null;
  pet_mob_name: string | null;
  pet_mob_name2: string | null;
  death_count: number | null;
};

type SummaryRow = RowDataPacket & {
  char_id: number;
  name: string;
  class: number;
  base_level: number;
  job_level: number;
  online: number;
  guild_name: string | null;
};

type InventoryRow = RowDataPacket & {
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
  broken: number | null;
  bound: number | null;
  favorite: number | null;
  expire_time: string | null;
  enchantgrade: number | null;
};

type CardRow = RowDataPacket & {
  id: number;
  name_english: string;
};

function mapSummary(row: SummaryRow): CharacterSummary {
  return {
    charId: row.char_id,
    name: row.name,
    jobClass: row.class,
    jobName: getJobName(row.class),
    baseLevel: row.base_level,
    jobLevel: row.job_level,
    online: row.online > 0,
    guildName: row.guild_name
  };
}

export async function getCharacterProfile(
  user: SessionUser,
  characterId: number
): Promise<CharacterProfile | null> {
  const pool = getPool(runtimeConfig.charDatabase);
  const [rows] = await pool.query<CharacterRow[]>(
    `SELECT
      ch.char_id,
      ch.account_id,
      ch.char_num,
      ch.name AS char_name,
      ch.class AS char_class,
      ch.base_level AS char_base_level,
      ch.job_level AS char_job_level,
      ch.base_exp AS char_base_exp,
      ch.job_exp AS char_job_exp,
      ch.zeny AS char_zeny,
      ch.str AS char_str,
      ch.agi AS char_agi,
      ch.vit AS char_vit,
      ch.int AS char_int,
      ch.dex AS char_dex,
      ch.luk AS char_luk,
      ch.hp AS char_hp,
      ch.max_hp AS char_max_hp,
      ch.sp AS char_sp,
      ch.max_sp AS char_max_sp,
      ch.status_point AS char_status_point,
      ch.skill_point AS char_skill_point,
      ch.online AS char_online,
      ch.party_id AS char_party_id,
      login.userid,
      login.sex AS gender,
      partner.name AS partner_name,
      mother.name AS mother_name,
      father.name AS father_name,
      child.name AS child_name,
      guild.guild_id,
      guild.name AS guild_name,
      guild_position.name AS guild_position,
      IFNULL(guild_position.exp_mode, 0) AS guild_tax,
      party.name AS party_name,
      party_leader.name AS party_leader_name,
      homun.name AS homun_name,
      homun.class AS homun_class,
      pet.name AS pet_name,
      pet_mob.name_english AS pet_mob_name,
      pet_mob2.name_english AS pet_mob_name2,
      IFNULL(reg.value, 0) AS death_count
     FROM \`char\` AS ch
     LEFT JOIN \`${runtimeConfig.loginDatabase.database}\`.\`login\` AS login ON login.account_id = ch.account_id
     LEFT JOIN \`char\` AS partner ON partner.char_id = ch.partner_id
     LEFT JOIN \`char\` AS mother ON mother.char_id = ch.mother
     LEFT JOIN \`char\` AS father ON father.char_id = ch.father
     LEFT JOIN \`char\` AS child ON child.char_id = ch.child
     LEFT JOIN \`guild_member\` ON guild_member.char_id = ch.char_id
     LEFT JOIN \`guild\` ON guild.guild_id = guild_member.guild_id
     LEFT JOIN \`guild_position\` ON guild_member.position = guild_position.position AND guild_member.guild_id = guild_position.guild_id
     LEFT JOIN \`party\` ON ch.party_id = party.party_id
     LEFT JOIN \`char\` AS party_leader ON party.leader_char = party_leader.char_id
     LEFT JOIN \`homunculus\` AS homun ON ch.homun_id = homun.homun_id
     LEFT JOIN \`pet\` ON ch.pet_id = pet.pet_id
     LEFT JOIN \`mob_db\` AS pet_mob ON pet_mob.ID = pet.class
     LEFT JOIN \`mob_db2\` AS pet_mob2 ON pet_mob2.ID = pet.class
     LEFT JOIN \`char_reg_num\` AS reg ON reg.char_id = ch.char_id AND reg.key = 'PC_DIE_COUNTER'
     WHERE ch.char_id = ? AND ch.account_id = ?
     LIMIT 1`,
    [characterId, user.accountId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const [friendRows] = await pool.query<SummaryRow[]>(
    `SELECT fr.char_id, fr.name, fr.class, fr.base_level, fr.job_level, fr.online, guild.name AS guild_name
     FROM \`char\` AS fr
     LEFT JOIN \`guild\` ON guild.guild_id = fr.guild_id
     LEFT JOIN \`friends\` ON friends.friend_id = fr.char_id
     WHERE friends.char_id = ?
     ORDER BY fr.name ASC`,
    [row.char_id]
  );

  const partyMembers = row.char_party_id
    ? await pool
        .query<SummaryRow[]>(
          `SELECT p.char_id, p.name, p.class, p.base_level, p.job_level, p.online, guild.name AS guild_name
           FROM \`char\` AS p
           LEFT JOIN \`guild\` ON guild.guild_id = p.guild_id
           WHERE p.party_id = ? AND p.char_id != ?
           ORDER BY p.name ASC`,
          [row.char_party_id, row.char_id]
        )
        .then(([members]) => members)
    : [];

  const itemTable = await resolveItemTableName();
  const inventory = itemTable
    ? await pool
        .query<InventoryRow[]>(
          `SELECT items.id AS item_id, items.name_english AS item_name, inventory.amount, inventory.identify, inventory.refine, inventory.equip${await buildInventorySelectSuffix()}
           FROM inventory
           LEFT JOIN \`${itemTable}\` AS items ON items.name_aegis = inventory.nameid OR items.id = inventory.nameid
           WHERE inventory.char_id = ?
           ORDER BY inventory.equip DESC, inventory.nameid ASC`,
          [row.char_id]
        )
        .then(([items]) => mapInventoryItems(items))
    : [];

  return {
    charId: row.char_id,
    accountId: row.account_id,
    slot: row.char_num + 1,
    name: row.char_name,
    accountName: row.userid,
    sex: row.gender,
    jobClass: row.char_class,
    jobName: getJobName(row.char_class),
    baseLevel: row.char_base_level,
    jobLevel: row.char_job_level,
    baseExp: row.char_base_exp,
    jobExp: row.char_job_exp,
    zeny: row.char_zeny,
    hp: row.char_hp,
    maxHp: row.char_max_hp,
    sp: row.char_sp,
    maxSp: row.char_max_sp,
    statusPoints: row.char_status_point,
    skillPoints: row.char_skill_point,
    stats: {
      str: row.char_str,
      agi: row.char_agi,
      vit: row.char_vit,
      int: row.char_int,
      dex: row.char_dex,
      luk: row.char_luk
    },
    online: row.char_online > 0,
    guild: {
      id: row.guild_id,
      name: row.guild_name,
      position: row.guild_position,
      tax: Number(row.guild_tax ?? 0)
    },
    party: {
      id: row.char_party_id || null,
      name: row.party_name,
      leaderName: row.party_leader_name,
      members: partyMembers.map(mapSummary)
    },
    family: {
      partnerName: row.partner_name,
      childName: row.child_name,
      motherName: row.mother_name,
      fatherName: row.father_name
    },
    pet: {
      name: row.pet_name,
      monsterName: row.pet_mob_name2 || row.pet_mob_name
    },
    homunculus: {
      name: row.homun_name,
      className: row.homun_class ? `Homunculus ${row.homun_class}` : null
    },
    deathCount: Number(row.death_count ?? 0),
    friends: friendRows.map(mapSummary),
    inventory
  };
}

let cachedItemTableName: string | null | undefined;
let inventorySelectSuffix: string | undefined;

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

async function buildInventorySelectSuffix(): Promise<string> {
  if (inventorySelectSuffix !== undefined) {
    return inventorySelectSuffix;
  }

  const columns = await getTableColumns(runtimeConfig.charDatabase, "inventory");
  const optional = ["card0", "card1", "card2", "card3", "broken", "bound", "favorite", "expire_time", "enchantgrade"];
  inventorySelectSuffix = optional
    .map((name) => (columns.has(name) ? `, inventory.${name}` : `, NULL AS ${name}`))
    .join("");
  return inventorySelectSuffix;
}

async function mapInventoryItems(rows: InventoryRow[]): Promise<InventoryItem[]> {
  const cardIds = Array.from(
    new Set(
      rows.flatMap((row) => [row.card0, row.card1, row.card2, row.card3]).filter((value): value is number => Number(value) > 0)
    )
  );

  const cardLookup = await resolveCardNames(cardIds);
  return rows.map((row) => mapInventoryItem(row, cardLookup));
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

function mapInventoryItem(row: InventoryRow, cardLookup: Map<number, string>): InventoryItem {
  return {
    itemId: Number(row.item_id ?? 0),
    name: row.item_name || "Unknown Item",
    amount: Number(row.amount ?? 0),
    identify: Number(row.identify ?? 0) > 0,
    refine: Number(row.refine ?? 0),
    equip: Number(row.equip ?? 0),
    cards: [row.card0, row.card1, row.card2, row.card3]
      .filter((value): value is number => Number(value) > 0)
      .map((value) => cardLookup.get(value) ?? `Card #${value}`),
    broken: Number(row.broken ?? 0) > 0,
    bound: Number(row.bound ?? 0) > 0,
    favorite: Number(row.favorite ?? 0) > 0,
    expireTime: row.expire_time ?? null,
    enchantGrade: Number(row.enchantgrade ?? 0)
  };
}
