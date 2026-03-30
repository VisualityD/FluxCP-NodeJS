import type { RowDataPacket } from "mysql2";
import type { ItemDropEntry, ItemListEntry, ItemProfile } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import {
  resolveEquipJobs,
  resolveEquipLocations,
  resolveEquipUpper,
  resolveTradeRestrictions
} from "../lib/flux-data.js";
import { getItemTypeName } from "../lib/items.js";
import { getElementName, getMonsterRaceName } from "../lib/monsters.js";
import { getExistingTables } from "../lib/schema.js";

type ItemRow = RowDataPacket & {
  item_id: number;
  identifier: string;
  name: string;
  type: string | null;
  subtype: string | null;
  price_buy: number | null;
  price_sell: number | null;
  weight: number | null;
  attack: number | null;
  defense: number | null;
  range: number | null;
  slots: number | null;
  gender: string | null;
  weapon_level: number | null;
  equip_level_min: number | null;
  equip_level_max: number | null;
  magic_attack: number | null;
  refineable: number | null;
  script: string | null;
  equip_script: string | null;
  unequip_script: string | null;
  origin_table: string;
  [key: string]: unknown;
};

type DropRow = RowDataPacket & {
  monster_id: number;
  monster_name: string;
  monster_level: number;
  monster_race: number;
  monster_element: number;
  monster_element_level: number;
  drop_name: string;
  drop_rate: number;
  drop_steal: number | null;
};

type ItemSearchInput = {
  itemId?: number | null;
  name?: string | null;
  type?: string | null;
};

async function detectItemTables() {
  const names = await getExistingTables(runtimeConfig.charDatabase, [
    "item_db",
    "item_db2",
    "item_db_re",
    "item_db2_re",
    "items",
    "mob_db",
    "mob_db2",
    "mob_db_re",
    "mob_db2_re"
  ]);

  const itemSources = names.has("items")
    ? ["items"]
    : names.has("item_db_re")
      ? ["item_db_re", "item_db2_re"].filter((name) => names.has(name))
      : ["item_db", "item_db2"].filter((name) => names.has(name));

  const mobSources = names.has("mob_db_re")
    ? ["mob_db_re", "mob_db2_re"].filter((name) => names.has(name))
    : ["mob_db", "mob_db2"].filter((name) => names.has(name));

  return {
    itemSources,
    mobSources
  };
}

function buildItemUnionQuery(itemTables: string[]): string {
  return itemTables
    .map((table) => {
      const sourceName = table.replace(/`/g, "");
      return `
        SELECT
          id AS item_id,
          name_aegis AS identifier,
          name_english AS name,
          type,
          subtype,
          price_buy,
          IFNULL(price_sell, FLOOR(price_buy / 2)) AS price_sell,
          weight / 10 AS weight,
          attack,
          defense,
          \`range\` AS \`range\`,
          slots,
          gender,
          weapon_level,
          equip_level_min,
          equip_level_max,
          IFNULL(magic_attack, 0) AS magic_attack,
          refineable,
          script,
          equip_script,
          unequip_script,
          job_all, job_novice, job_supernovice, job_swordman, job_mage, job_archer, job_acolyte, job_merchant,
          job_thief, job_knight, job_priest, job_wizard, job_blacksmith, job_hunter, job_assassin, job_crusader,
          job_monk, job_sage, job_rogue, job_alchemist, job_barddancer, job_taekwon, job_stargladiator,
          job_soullinker, job_gunslinger, job_ninja, job_kagerouoboro, job_rebellion, job_summoner,
          class_all, class_normal, class_upper, class_baby, class_third, class_third_upper, class_third_baby,
          location_head_low, location_right_hand, location_garment, location_right_accessory, location_armor,
          location_left_hand, location_shoes, location_left_accessory, location_head_top, location_head_mid,
          location_costume_head_top, location_costume_head_mid, location_costume_head_low, location_costume_garment,
          location_ammo, location_shadow_armor, location_shadow_weapon, location_shadow_shield, location_shadow_shoes,
          location_shadow_right_accessory, location_shadow_left_accessory,
          trade_nodrop, trade_notrade, trade_tradepartner, trade_nosell, trade_nocart, trade_nostorage,
          trade_noguildstorage, trade_nomail, trade_noauction,
          '${sourceName}' AS origin_table
        FROM \`${table}\`
      `;
    })
    .join(" UNION ALL ");
}

function mapItemRow(row: ItemRow): ItemListEntry {
  return {
    itemId: row.item_id,
    identifier: row.identifier,
    name: row.name,
    type: getItemTypeName(row.type),
    subtype: row.subtype,
    priceBuy: Number(row.price_buy ?? 0),
    priceSell: Number(row.price_sell ?? 0),
    weight: Number(row.weight ?? 0),
    attack: Number(row.attack ?? 0),
    defense: Number(row.defense ?? 0),
    range: Number(row.range ?? 0),
    slots: Number(row.slots ?? 0),
    refineable: Number(row.refineable ?? 0) > 0,
    custom: /item_db2/i.test(row.origin_table)
  };
}

async function getItemDrops(identifier: string, mobTables: string[]): Promise<ItemDropEntry[]> {
  if (mobTables.length === 0) {
    return [];
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const unions = mobTables
    .map(
      (table) => `
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop1' AS drop_name, drop1_rate AS drop_rate, drop1_nosteal AS drop_steal FROM \`${table}\` WHERE drop1_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop2' AS drop_name, drop2_rate AS drop_rate, drop2_nosteal AS drop_steal FROM \`${table}\` WHERE drop2_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop3' AS drop_name, drop3_rate AS drop_rate, drop3_nosteal AS drop_steal FROM \`${table}\` WHERE drop3_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop4' AS drop_name, drop4_rate AS drop_rate, drop4_nosteal AS drop_steal FROM \`${table}\` WHERE drop4_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop5' AS drop_name, drop5_rate AS drop_rate, drop5_nosteal AS drop_steal FROM \`${table}\` WHERE drop5_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop6' AS drop_name, drop6_rate AS drop_rate, drop6_nosteal AS drop_steal FROM \`${table}\` WHERE drop6_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop7' AS drop_name, drop7_rate AS drop_rate, drop7_nosteal AS drop_steal FROM \`${table}\` WHERE drop7_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop8' AS drop_name, drop8_rate AS drop_rate, drop8_nosteal AS drop_steal FROM \`${table}\` WHERE drop8_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop9' AS drop_name, drop9_rate AS drop_rate, drop9_nosteal AS drop_steal FROM \`${table}\` WHERE drop9_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'drop10' AS drop_name, drop10_rate AS drop_rate, drop10_nosteal AS drop_steal FROM \`${table}\` WHERE drop10_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'mvpdrop1' AS drop_name, mvpdrop1_rate AS drop_rate, 1 AS drop_steal FROM \`${table}\` WHERE mvpdrop1_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'mvpdrop2' AS drop_name, mvpdrop2_rate AS drop_rate, 1 AS drop_steal FROM \`${table}\` WHERE mvpdrop2_item = ?
        UNION ALL
        SELECT id AS monster_id, name_english AS monster_name, level AS monster_level, race AS monster_race, element AS monster_element, element_level AS monster_element_level, 'mvpdrop3' AS drop_name, mvpdrop3_rate AS drop_rate, 1 AS drop_steal FROM \`${table}\` WHERE mvpdrop3_item = ?
      `
    )
    .join(" UNION ALL ");

  const bind = Array.from({ length: mobTables.length * 13 }, () => identifier);
  const [rows] = await pool.query<DropRow[]>(unions, bind);

  return rows
    .map((row) => ({
      monsterId: row.monster_id,
      monsterName: row.monster_name,
      monsterLevel: row.monster_level,
      monsterRace: getMonsterRaceName(row.monster_race),
      monsterElement: `${getElementName(row.monster_element)} (Lv ${Math.floor(row.monster_element_level)})`,
      canSteal: Number(row.drop_steal ?? 0) === 0,
      dropRate: Number(row.drop_rate ?? 0) / 100,
      isMvp: row.drop_name.startsWith("mvp")
    }))
    .sort((left, right) => right.dropRate - left.dropRate || left.monsterName.localeCompare(right.monsterName));
}

export async function searchItems(input: ItemSearchInput): Promise<ItemListEntry[]> {
  const { itemSources } = await detectItemTables();
  if (itemSources.length === 0) {
    return [];
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const unionQuery = buildItemUnionQuery(itemSources);
  const bind: Array<number | string> = [];
  const filters: string[] = ["1=1"];

  if (typeof input.itemId === "number") {
    filters.push("item_id = ?");
    bind.push(input.itemId);
  }

  if (input.name?.trim()) {
    filters.push("(name LIKE ? OR identifier LIKE ?)");
    bind.push(`%${input.name.trim()}%`, `%${input.name.trim()}%`);
  }

  if (input.type?.trim()) {
    filters.push("type = ?");
    bind.push(input.type.trim());
  }

  const [rows] = await pool.query<ItemRow[]>(
    `SELECT * FROM (${unionQuery}) AS items WHERE ${filters.join(" AND ")} ORDER BY item_id ASC LIMIT 100`,
    bind
  );

  return rows.map(mapItemRow);
}

export async function getItemProfile(itemId: number): Promise<ItemProfile | null> {
  const { itemSources, mobSources } = await detectItemTables();
  if (itemSources.length === 0) {
    return null;
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const unionQuery = buildItemUnionQuery(itemSources);
  const [rows] = await pool.query<ItemRow[]>(
    `SELECT * FROM (${unionQuery}) AS items WHERE item_id = ? LIMIT 1`,
    [itemId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const drops = await getItemDrops(row.identifier, mobSources);

  return {
    itemId: row.item_id,
    identifier: row.identifier,
    name: row.name,
    type: getItemTypeName(row.type),
    subtype: row.subtype,
    priceBuy: Number(row.price_buy ?? 0),
    priceSell: Number(row.price_sell ?? 0),
    weight: Number(row.weight ?? 0),
    attack: Number(row.attack ?? 0),
    defense: Number(row.defense ?? 0),
    range: Number(row.range ?? 0),
    slots: Number(row.slots ?? 0),
    weaponLevel: Number(row.weapon_level ?? 0),
    equipLevelMin: Number(row.equip_level_min ?? 0),
    equipLevelMax: Number(row.equip_level_max ?? 0),
    magicAttack: Number(row.magic_attack ?? 0),
    refineable: Number(row.refineable ?? 0) > 0,
    custom: /item_db2/i.test(row.origin_table),
    equipJobs: resolveEquipJobs(row),
    equipUpper: resolveEquipUpper(row),
    equipLocations: resolveEquipLocations(row),
    gender: row.gender,
    tradeRestrictions: resolveTradeRestrictions(row),
    script: row.script,
    equipScript: row.equip_script,
    unequipScript: row.unequip_script,
    drops
  };
}
