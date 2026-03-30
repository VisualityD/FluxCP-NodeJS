const equipJobs = [
  "job_all",
  "job_novice",
  "job_supernovice",
  "job_swordman",
  "job_mage",
  "job_archer",
  "job_acolyte",
  "job_merchant",
  "job_thief",
  "job_knight",
  "job_priest",
  "job_wizard",
  "job_blacksmith",
  "job_hunter",
  "job_assassin",
  "job_crusader",
  "job_monk",
  "job_sage",
  "job_rogue",
  "job_alchemist",
  "job_barddancer",
  "job_taekwon",
  "job_stargladiator",
  "job_soullinker",
  "job_gunslinger",
  "job_ninja",
  "job_kagerouoboro",
  "job_rebellion",
  "job_summoner"
] as const;

const equipJobNames: Record<string, string> = {
  job_all: "All jobs",
  job_novice: "Novice",
  job_supernovice: "Super novice",
  job_swordman: "Swordman",
  job_mage: "Mage",
  job_archer: "Archer",
  job_acolyte: "Acolyte",
  job_merchant: "Merchant",
  job_thief: "Thief",
  job_knight: "Knight",
  job_priest: "Priest",
  job_wizard: "Wizard",
  job_blacksmith: "Blacksmith",
  job_hunter: "Hunter",
  job_assassin: "Assassin",
  job_crusader: "Crusader",
  job_monk: "Monk",
  job_sage: "Sage",
  job_rogue: "Rogue",
  job_alchemist: "Alchemist",
  job_barddancer: "Bard / Dancer",
  job_taekwon: "Taekwon",
  job_stargladiator: "Star Gladiator",
  job_soullinker: "Soul Linker",
  job_gunslinger: "Gunslinger",
  job_ninja: "Ninja",
  job_kagerouoboro: "Kagerou / Oboro",
  job_rebellion: "Rebellion",
  job_summoner: "Summoner"
};

const equipUpper = [
  "class_all",
  "class_normal",
  "class_upper",
  "class_baby",
  "class_third",
  "class_third_upper",
  "class_third_baby"
] as const;

const equipUpperNames: Record<string, string> = {
  class_all: "All classes",
  class_normal: "Normal",
  class_upper: "Upper",
  class_baby: "Baby",
  class_third: "Third",
  class_third_upper: "Third Upper",
  class_third_baby: "Third Baby"
};

const equipLocations = [
  "location_head_low",
  "location_right_hand",
  "location_garment",
  "location_right_accessory",
  "location_armor",
  "location_left_hand",
  "location_shoes",
  "location_left_accessory",
  "location_head_top",
  "location_head_mid",
  "location_costume_head_top",
  "location_costume_head_mid",
  "location_costume_head_low",
  "location_costume_garment",
  "location_ammo",
  "location_shadow_armor",
  "location_shadow_weapon",
  "location_shadow_shield",
  "location_shadow_shoes",
  "location_shadow_right_accessory",
  "location_shadow_left_accessory"
] as const;

const equipLocationNames: Record<string, string> = {
  location_head_low: "Lower Headgear",
  location_right_hand: "Main Hand",
  location_garment: "Garment",
  location_right_accessory: "Accessory Right",
  location_armor: "Armor",
  location_left_hand: "Off Hand",
  location_shoes: "Footgear",
  location_left_accessory: "Accessory Left",
  location_head_top: "Upper Headgear",
  location_head_mid: "Middle Headgear",
  location_costume_head_top: "Costume Top Headgear",
  location_costume_head_mid: "Costume Mid Headgear",
  location_costume_head_low: "Costume Low Headgear",
  location_costume_garment: "Costume Garment",
  location_ammo: "Ammo",
  location_shadow_armor: "Shadow Armor",
  location_shadow_weapon: "Shadow Weapon",
  location_shadow_shield: "Shadow Shield",
  location_shadow_shoes: "Shadow Shoes",
  location_shadow_right_accessory: "Shadow Accessory Right (Earring)",
  location_shadow_left_accessory: "Shadow Accessory Left (Pendant)"
};

const equipLocationCombinations: Record<string, string> = {
  "location_left_hand/location_right_hand": "Two-Handed",
  "location_head_low/location_head_mid/location_head_top": "Upper/Mid/Lower Headgear",
  "location_head_mid/location_head_top": "Upper/Mid Headgear",
  "location_head_top/location_head_low": "Upper/Lower Headgear",
  "location_head_low/location_head_mid": "Mid/Lower Headgear",
  "location_head_low/location_head_top": "Upper/Lower Headgear",
  "location_costume_head_mid/location_costume_head_top": "Costume Upper/Mid Headgear",
  "location_costume_head_low/location_costume_head_top": "Costume Upper/Lower Headgear",
  "location_costume_head_low/location_costume_head_mid": "Costume Mid/Lower Headgear",
  "location_costume_head_low/location_costume_head_mid/location_costume_head_top":
    "Costume Upper/Mid/Lower Headgear",
  "location_left_accessory/location_right_accessory": "Accessory Left/Right",
  "location_armor/location_garment/location_head_low/location_head_mid/location_head_top/location_left_accessory/location_left_hand/location_right_accessory/location_right_hand/location_shoes":
    "All equip"
};

const tradeRestrictions = [
  "trade_nodrop",
  "trade_notrade",
  "trade_tradepartner",
  "trade_nosell",
  "trade_nocart",
  "trade_nostorage",
  "trade_noguildstorage",
  "trade_nomail",
  "trade_noauction"
] as const;

const tradeRestrictionNames: Record<string, string> = {
  trade_nodrop: "Can't be dropped",
  trade_notrade: "Can't be traded with player",
  trade_tradepartner: "Can't be traded with partner",
  trade_nosell: "Can't be sold to NPC",
  trade_nocart: "Can't be put in Cart",
  trade_nostorage: "Can't be put in Storage",
  trade_noguildstorage: "Can't be put in Guild Storage",
  trade_nomail: "Can't be attached in Mail",
  trade_noauction: "Can't be auctioned"
};

const monsterModes = [
  "mode_aggressive",
  "mode_angry",
  "mode_assist",
  "mode_canattack",
  "mode_canmove",
  "mode_castsensorchase",
  "mode_castsensoridle",
  "mode_changechase",
  "mode_changetargetchase",
  "mode_changetargetmelee",
  "mode_detector",
  "mode_fixeditemdrop",
  "mode_ignoremagic",
  "mode_ignoremelee",
  "mode_ignoremisc",
  "mode_ignoreranged",
  "mode_knockbackimmune",
  "mode_looter",
  "mode_mvp",
  "mode_norandomwalk",
  "mode_randomtarget",
  "mode_skillimmune",
  "mode_statusimmune",
  "mode_targetweak",
  "mode_teleportblock"
] as const;

const monsterModeNames: Record<string, string> = {
  mode_aggressive: "Aggressive",
  mode_angry: "Angry",
  mode_assist: "Assist",
  mode_canattack: "Can Attack",
  mode_canmove: "Can Move",
  mode_castsensorchase: "Cast Sensor Chase",
  mode_castsensoridle: "Cast Sensor Idle",
  mode_changechase: "Change Chase",
  mode_changetargetchase: "Change Target Chase",
  mode_changetargetmelee: "Change Target Melee",
  mode_detector: "Detector",
  mode_fixeditemdrop: "Fixed Item Drop",
  mode_ignoremagic: "Ignore Magic",
  mode_ignoremelee: "Ignore Melee",
  mode_ignoremisc: "Ignore Misc",
  mode_ignoreranged: "Ignore Ranged",
  mode_knockbackimmune: "Knockback Immune",
  mode_looter: "Looter",
  mode_mvp: "MVP",
  mode_norandomwalk: "Plant",
  mode_randomtarget: "Random Target",
  mode_skillimmune: "Skill Immune",
  mode_statusimmune: "Status Immune",
  mode_targetweak: "Target Weak",
  mode_teleportblock: "Teleport Block"
};

const monsterAiModes: Record<number, string[]> = {
  1: ["mode_canattack", "mode_canmove"],
  2: ["mode_canattack", "mode_looter", "mode_canmove"],
  3: ["mode_changetargetmelee", "mode_canattack", "mode_assist", "mode_canmove"],
  4: ["mode_changetargetchase", "mode_changetargetmelee", "mode_angry", "mode_canattack", "mode_aggressive", "mode_canmove"],
  5: ["mode_changetargetchase", "mode_canattack", "mode_aggressive", "mode_canmove"],
  7: ["mode_changetargetmelee", "mode_canattack", "mode_assist", "mode_looter", "mode_canmove"],
  8: ["mode_targetweak", "mode_changetargetchase", "mode_changetargetmelee", "mode_canattack", "mode_aggressive", "mode_canmove"],
  9: ["mode_changetargetchase", "mode_changetargetmelee", "mode_canattack", "mode_castsensoridle", "mode_aggressive", "mode_canmove"],
  10: ["mode_canattack", "mode_aggressive"],
  11: ["mode_canattack", "mode_aggressive"],
  12: ["mode_changetargetchase", "mode_canattack", "mode_aggressive", "mode_canmove"],
  13: ["mode_changetargetchase", "mode_changetargetmelee", "mode_canattack", "mode_assist", "mode_aggressive", "mode_canmove"],
  17: ["mode_canattack", "mode_castsensoridle", "mode_canmove"],
  19: ["mode_changetargetchase", "mode_changetargetmelee", "mode_canattack", "mode_castsensoridle", "mode_aggressive", "mode_canmove"],
  20: ["mode_changetargetchase", "mode_changetargetmelee", "mode_castsensorchase", "mode_canattack", "mode_castsensoridle", "mode_aggressive", "mode_canmove"],
  21: ["mode_changetargetchase", "mode_changetargetmelee", "mode_changechase", "mode_castsensorchase", "mode_canattack", "mode_castsensoridle", "mode_aggressive", "mode_canmove"],
  24: ["mode_canattack", "mode_norandomwalk", "mode_canmove"],
  25: ["mode_canmove"],
  26: ["mode_randomtarget", "mode_changetargetchase", "mode_changetargetmelee", "mode_changechase", "mode_castsensorchase", "mode_canattack", "mode_castsensoridle", "mode_aggressive", "mode_canmove"],
  27: ["mode_randomtarget", "mode_canattack", "mode_aggressive"]
};

export function resolveFlagList<T extends string>(
  row: Record<string, unknown>,
  names: readonly T[],
  labelMap: Record<T, string>
): string[] {
  const keys = names.filter((name) => Boolean(row[name]));
  if (keys.includes("job_all" as T) || keys.includes("class_all" as T)) {
    return [labelMap[keys.find((name) => name === ("job_all" as T) || name === ("class_all" as T)) ?? keys[0]]];
  }

  return keys.map((name) => labelMap[name]);
}

export function resolveEquipLocations(row: Record<string, unknown>): string[] {
  const keys = equipLocations.filter((name) => Boolean(row[name]));
  if (keys.length === 0) {
    return [];
  }

  const combination = equipLocationCombinations[keys.slice().sort().join("/")];
  if (combination) {
    return [combination];
  }

  return keys.map((name) => equipLocationNames[name]);
}

export function resolveMonsterModes(row: Record<string, unknown>, ai: number | null): string[] {
  const direct = monsterModes.filter((name) => Boolean(row[name]));
  const aiModes = ai ? monsterAiModes[ai] ?? [] : [];
  return Array.from(new Set([...aiModes, ...direct])).map((name) => monsterModeNames[name] ?? name);
}

export function resolveEquipJobs(row: Record<string, unknown>): string[] {
  return resolveFlagList(row, equipJobs, equipJobNames);
}

export function resolveEquipUpper(row: Record<string, unknown>): string[] {
  return resolveFlagList(row, equipUpper, equipUpperNames);
}

export function resolveTradeRestrictions(row: Record<string, unknown>): string[] {
  return resolveFlagList(row, tradeRestrictions, tradeRestrictionNames);
}
