import type { RowDataPacket } from "mysql2";
import type { MonsterListEntry, MonsterProfile, MonsterSkill } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { resolveMonsterModes } from "../lib/flux-data.js";
import { getElementName, getMonsterRaceName, getMonsterSizeName } from "../lib/monsters.js";
import { getExistingTables } from "../lib/schema.js";

type MonsterRow = RowDataPacket & {
  monster_id: number;
  sprite: string;
  name_english: string;
  name_japanese: string;
  level: number;
  hp: number;
  sp: number | null;
  size: number;
  race: number;
  element: number;
  element_level: number;
  base_exp: number;
  job_exp: number;
  mvp_exp: number;
  attack: number;
  attack2: number;
  defense: number;
  magic_defense: number;
  attack_range: number;
  skill_range: number;
  chase_range: number;
  walk_speed: number;
  attack_delay: number;
  attack_motion: number;
  damage_motion: number;
  ai: number | null;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  dexterity: number;
  luck: number;
  drop1_item: string | null;
  drop1_rate: number | null;
  drop1_nosteal: number | null;
  drop2_item: string | null;
  drop2_rate: number | null;
  drop2_nosteal: number | null;
  drop3_item: string | null;
  drop3_rate: number | null;
  drop3_nosteal: number | null;
  drop4_item: string | null;
  drop4_rate: number | null;
  drop4_nosteal: number | null;
  drop5_item: string | null;
  drop5_rate: number | null;
  drop5_nosteal: number | null;
  drop6_item: string | null;
  drop6_rate: number | null;
  drop6_nosteal: number | null;
  drop7_item: string | null;
  drop7_rate: number | null;
  drop7_nosteal: number | null;
  drop8_item: string | null;
  drop8_rate: number | null;
  drop8_nosteal: number | null;
  drop9_item: string | null;
  drop9_rate: number | null;
  drop9_nosteal: number | null;
  drop10_item: string | null;
  drop10_rate: number | null;
  drop10_nosteal: number | null;
  mvpdrop1_item: string | null;
  mvpdrop1_rate: number | null;
  mvpdrop2_item: string | null;
  mvpdrop2_rate: number | null;
  mvpdrop3_item: string | null;
  mvpdrop3_rate: number | null;
  origin_table: string;
  [key: string]: unknown;
};

type MonsterSearchInput = {
  monsterId?: number | null;
  name?: string | null;
  mvp?: string | null;
};

type ItemLookupRow = RowDataPacket & {
  id: number;
  name_aegis: string;
  name_english: string;
};

type MonsterSkillRow = RowDataPacket & {
  INFO: string | null;
  SKILL_LV: number | null;
  STATE: string | null;
  RATE: number | null;
  CASTTIME: number | null;
  DELAY: number | null;
  CANCELABLE: string | null;
  TARGET: string | null;
  CONDITION: string | null;
  CONDITION_VALUE: string | null;
};

async function detectMonsterTables() {
  const names = await getExistingTables(runtimeConfig.charDatabase, [
    "mob_db",
    "mob_db2",
    "mob_db_re",
    "mob_db2_re",
    "monsters",
    "item_db",
    "item_db2",
    "item_db_re",
    "item_db2_re",
    "items",
    "mob_skill_db",
    "mob_skill_db2",
    "mob_skill_db_re",
    "mob_skill_db2_re",
    "mobskills"
  ]);

  const monsterSources = names.has("monsters")
    ? ["monsters"]
    : names.has("mob_db_re")
      ? ["mob_db_re", "mob_db2_re"].filter((name) => names.has(name))
      : ["mob_db", "mob_db2"].filter((name) => names.has(name));

  const itemSources = names.has("items")
    ? ["items"]
    : names.has("item_db_re")
      ? ["item_db_re", "item_db2_re"].filter((name) => names.has(name))
      : ["item_db", "item_db2"].filter((name) => names.has(name));

  const skillSources = names.has("mobskills")
    ? ["mobskills"]
    : names.has("mob_skill_db_re")
      ? ["mob_skill_db_re", "mob_skill_db2_re"].filter((name) => names.has(name))
      : ["mob_skill_db", "mob_skill_db2"].filter((name) => names.has(name));

  return {
    monsterSources,
    itemSources,
    skillSources
  };
}

function buildMonsterUnionQuery(monsterTables: string[]): string {
  return monsterTables
    .map((table) => {
      const sourceName = table.replace(/`/g, "");
      return `
        SELECT
          ID AS monster_id,
          name_aegis AS sprite,
          name_english,
          name_japanese,
          level,
          HP AS hp,
          0 AS sp,
          size,
          race,
          element,
          element_level,
          base_exp,
          job_exp,
          mvp_exp,
          attack,
          attack2,
          defense,
          magic_defense,
          attack_range,
          skill_range,
          chase_range,
          walk_speed,
          attack_delay,
          attack_motion,
          damage_motion,
          ai,
          STR AS strength,
          AGI AS agility,
          VIT AS vitality,
          \`INT\` AS intelligence,
          DEX AS dexterity,
          LUK AS luck,
          drop1_item, drop1_rate, drop1_nosteal,
          drop2_item, drop2_rate, drop2_nosteal,
          drop3_item, drop3_rate, drop3_nosteal,
          drop4_item, drop4_rate, drop4_nosteal,
          drop5_item, drop5_rate, drop5_nosteal,
          drop6_item, drop6_rate, drop6_nosteal,
          drop7_item, drop7_rate, drop7_nosteal,
          drop8_item, drop8_rate, drop8_nosteal,
          drop9_item, drop9_rate, drop9_nosteal,
          drop10_item, drop10_rate, drop10_nosteal,
          mvpdrop1_item, mvpdrop1_rate,
          mvpdrop2_item, mvpdrop2_rate,
          mvpdrop3_item, mvpdrop3_rate,
          mode_aggressive, mode_angry, mode_assist, mode_canattack, mode_canmove,
          mode_castsensorchase, mode_castsensoridle, mode_changechase, mode_changetargetchase,
          mode_changetargetmelee, mode_detector, mode_fixeditemdrop, mode_ignoremagic,
          mode_ignoremelee, mode_ignoremisc, mode_ignoreranged, mode_knockbackimmune,
          mode_looter, mode_mvp, mode_norandomwalk, mode_randomtarget, mode_skillimmune,
          mode_statusimmune, mode_targetweak, mode_teleportblock,
          '${sourceName}' AS origin_table
        FROM \`${table}\`
      `;
    })
    .join(" UNION ALL ");
}

function buildItemUnionQuery(itemTables: string[]): string {
  return itemTables
    .map((table) => `SELECT id, name_aegis, name_english FROM \`${table}\``)
    .join(" UNION ALL ");
}

export async function searchMonsters(input: MonsterSearchInput): Promise<MonsterListEntry[]> {
  const { monsterSources } = await detectMonsterTables();
  if (monsterSources.length === 0) {
    return [];
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const unionQuery = buildMonsterUnionQuery(monsterSources);
  const bind: Array<number | string> = [];
  const filters: string[] = ["1=1"];

  if (typeof input.monsterId === "number") {
    filters.push("monster_id = ?");
    bind.push(input.monsterId);
  }

  if (input.name?.trim()) {
    filters.push("(name_english LIKE ? OR name_japanese LIKE ?)");
    bind.push(`%${input.name.trim()}%`, `%${input.name.trim()}%`);
  }

  if (input.mvp === "yes") {
    filters.push("mvp_exp > 0");
  } else if (input.mvp === "no") {
    filters.push("mvp_exp = 0");
  }

  const [rows] = await pool.query<MonsterRow[]>(
    `SELECT * FROM (${unionQuery}) AS monsters WHERE ${filters.join(" AND ")} ORDER BY monster_id ASC LIMIT 100`,
    bind
  );

  return rows.map((row) => ({
    monsterId: row.monster_id,
    nameEnglish: row.name_english,
    nameJapanese: row.name_japanese,
    level: row.level,
    hp: row.hp,
    size: getMonsterSizeName(row.size),
    race: getMonsterRaceName(row.race),
    element: `${getElementName(row.element)} (Lv ${Math.floor(row.element_level)})`,
    baseExp: row.base_exp,
    jobExp: row.job_exp,
    isMvp: row.mvp_exp > 0,
    custom: /mob_db2/i.test(row.origin_table)
  }));
}

export async function getMonsterProfile(monsterId: number): Promise<MonsterProfile | null> {
  const { monsterSources, itemSources, skillSources } = await detectMonsterTables();
  if (monsterSources.length === 0) {
    return null;
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const unionQuery = buildMonsterUnionQuery(monsterSources);
  const [rows] = await pool.query<MonsterRow[]>(
    `SELECT * FROM (${unionQuery}) AS monsters WHERE monster_id = ? LIMIT 1`,
    [monsterId]
  );

  const monster = rows[0];
  if (!monster) {
    return null;
  }

  const dropAegisNames = [
    monster.drop1_item,
    monster.drop2_item,
    monster.drop3_item,
    monster.drop4_item,
    monster.drop5_item,
    monster.drop6_item,
    monster.drop7_item,
    monster.drop8_item,
    monster.drop9_item,
    monster.drop10_item,
    monster.mvpdrop1_item,
    monster.mvpdrop2_item,
    monster.mvpdrop3_item
  ].filter((value): value is string => Boolean(value));

  let itemLookup = new Map<string, ItemLookupRow>();
  if (dropAegisNames.length > 0 && itemSources.length > 0) {
    const itemQuery = buildItemUnionQuery(itemSources);
    const placeholders = dropAegisNames.map(() => "?").join(", ");
    const [itemRows] = await pool.query<ItemLookupRow[]>(
      `SELECT * FROM (${itemQuery}) AS items WHERE name_aegis IN (${placeholders})`,
      dropAegisNames
    );
    itemLookup = new Map(itemRows.map((row) => [row.name_aegis, row]));
  }

  const dropFields = [
    ["drop1", monster.drop1_item, monster.drop1_rate, false],
    ["drop2", monster.drop2_item, monster.drop2_rate, false],
    ["drop3", monster.drop3_item, monster.drop3_rate, false],
    ["drop4", monster.drop4_item, monster.drop4_rate, false],
    ["drop5", monster.drop5_item, monster.drop5_rate, false],
    ["drop6", monster.drop6_item, monster.drop6_rate, false],
    ["drop7", monster.drop7_item, monster.drop7_rate, false],
    ["drop8", monster.drop8_item, monster.drop8_rate, false],
    ["drop9", monster.drop9_item, monster.drop9_rate, false],
    ["drop10", monster.drop10_item, monster.drop10_rate, false],
    ["mvpdrop1", monster.mvpdrop1_item, monster.mvpdrop1_rate, true],
    ["mvpdrop2", monster.mvpdrop2_item, monster.mvpdrop2_rate, true],
    ["mvpdrop3", monster.mvpdrop3_item, monster.mvpdrop3_rate, true]
  ] as const;

  const drops = dropFields
    .filter(([, aegis]) => Boolean(aegis))
    .map(([fieldName, aegis, rate, isMvp]) => {
      const item = aegis ? itemLookup.get(aegis) : null;
      const stealField = `${fieldName}_nosteal` as keyof MonsterRow;
      return {
        itemId: item?.id ?? 0,
        itemName: item?.name_english ?? aegis ?? "Unknown",
        canSteal: isMvp ? false : Number(monster[stealField] ?? 0) === 0,
        chance: Number(rate ?? 0) / 100,
        isMvp
      };
    });

  const skills = skillSources.length > 0 ? await loadMonsterSkills(pool, skillSources, monsterId) : [];

  return {
    monsterId: monster.monster_id,
    sprite: monster.sprite,
    nameEnglish: monster.name_english,
    nameJapanese: monster.name_japanese,
    level: monster.level,
    hp: monster.hp,
    sp: Number(monster.sp ?? 0),
    size: getMonsterSizeName(monster.size),
    race: getMonsterRaceName(monster.race),
    element: getElementName(monster.element),
    elementLevel: Math.floor(monster.element_level),
    baseExp: monster.base_exp,
    jobExp: monster.job_exp,
    mvpExp: monster.mvp_exp,
    attack: monster.attack,
    attack2: monster.attack2,
    defense: monster.defense,
    magicDefense: monster.magic_defense,
    attackRange: monster.attack_range,
    skillRange: monster.skill_range,
    chaseRange: monster.chase_range,
    walkSpeed: monster.walk_speed,
    attackDelay: monster.attack_delay,
    attackMotion: monster.attack_motion,
    damageMotion: monster.damage_motion,
    stats: {
      str: monster.strength,
      agi: monster.agility,
      vit: monster.vitality,
      int: monster.intelligence,
      dex: monster.dexterity,
      luk: monster.luck
    },
    isMvp: monster.mvp_exp > 0,
    custom: /mob_db2/i.test(monster.origin_table),
    mode: resolveMonsterModes(monster, monster.ai ?? null),
    drops,
    skills
  };
}

async function loadMonsterSkills(
  pool: ReturnType<typeof getPool>,
  skillTables: string[],
  monsterId: number
): Promise<MonsterSkill[]> {
  const unionQuery = skillTables
    .map(
      (table) => `
        SELECT INFO, SKILL_LV, STATE, RATE, CASTTIME, DELAY, CANCELABLE, TARGET, CONDITION, CONDITION_VALUE
        FROM \`${table}\`
        WHERE mob_id = ?
      `
    )
    .join(" UNION ALL ");

  const [rows] = await pool.query<MonsterSkillRow[]>(
    unionQuery,
    skillTables.map(() => monsterId)
  );

  return rows.map((row) => ({
    name: row.INFO || "Unknown Skill",
    level: Number(row.SKILL_LV ?? 0),
    state: row.STATE || "Any",
    rate: Number(row.RATE ?? 0) / 100,
    castTime: Number(row.CASTTIME ?? 0) / 1000,
    delay: Number(row.DELAY ?? 0) / 1000,
    cancelable: row.CANCELABLE || "No",
    target: row.TARGET || "None",
    condition: row.CONDITION || "None",
    conditionValue: row.CONDITION_VALUE?.trim() || null
  }));
}
