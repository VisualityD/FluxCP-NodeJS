export type MenuItem = {
  name: string;
  module: string;
  action: string;
  url: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export type NewsItem = {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  link?: string;
};

export type ServerStatus = {
  groupName: string;
  serverName: string;
  loginServerUp: boolean;
  charServerUp: boolean;
  mapServerUp: boolean;
  playersOnline: number;
  playersPeak: number;
};

export type LayoutPayload = {
  siteTitle: string;
  menuSections: MenuSection[];
  currentTheme: "default" | "bootstrap";
  availableThemes: Array<"default" | "bootstrap">;
  user: {
    username: string;
    serverName: string;
    isAdmin: boolean;
  } | null;
};

export type SessionUser = {
  accountId: number;
  username: string;
  groupId: number;
  groupLevel: number;
  serverName: string;
  loginDate: string;
};

export type AccountCharacter = {
  charId: number;
  name: string;
  jobClass: number;
  jobName?: string;
  baseLevel: number;
  jobLevel: number;
  zeny: number;
  online: boolean;
};

export type InventoryItem = {
  itemId: number;
  name: string;
  amount: number;
  identify: boolean;
  refine: number;
  equip: number;
  cards: string[];
  broken: boolean;
  bound: boolean;
  favorite: boolean;
  expireTime: string | null;
  enchantGrade: number;
};

export type JobDistributionEntry = {
  jobClass: number;
  jobName: string;
  total: number;
};

export type ServerInfo = {
  serverName: string;
  accounts: number;
  characters: number;
  guilds: number;
  parties: number;
  zeny: number;
  classDistribution: JobDistributionEntry[];
};

export type CastleInfo = {
  castleId: number;
  castleName: string;
  guildId: number | null;
  guildName: string | null;
  economy: number;
};

export type WoeTimeEntry = {
  startingDay: string;
  startingHour: string;
  endingDay: string;
  endingHour: string;
};

export type WoeSchedule = {
  serverName: string;
  serverTime: string;
  entries: WoeTimeEntry[];
};

export type VendingSummary = {
  id: number;
  charId: number | null;
  charName: string;
  sex: string;
  map: string;
  x: number;
  y: number;
  title: string;
  autotrade: boolean;
};

export type VendingItem = {
  cartInventoryId: number;
  itemId: number;
  itemName: string;
  refine: number;
  slots: number;
  cards: string[];
  options: string[];
  price: number;
  amount: number;
};

export type VendingShop = {
  id: number;
  accountId: number | null;
  charId: number | null;
  charName: string;
  sex: string;
  map: string;
  x: number;
  y: number;
  title: string;
  autotrade: boolean;
  items: VendingItem[];
};

export type BuyingStoreSummary = {
  id: number;
  charId: number | null;
  charName: string;
  sex: string;
  map: string;
  x: number;
  y: number;
  title: string;
  autotrade: boolean;
};

export type BuyingStoreItem = {
  itemId: number;
  itemName: string;
  price: number;
  amount: number;
};

export type BuyingStore = {
  id: number;
  charId: number | null;
  charName: string;
  sex: string;
  map: string;
  x: number;
  y: number;
  title: string;
  autotrade: boolean;
  items: BuyingStoreItem[];
};

export type AccountProfile = {
  accountId: number;
  username: string;
  email: string | null;
  groupId: number;
  groupName: string;
  state: number;
  sex: string;
  loginCount: number;
  birthdate: string | null;
  lastLogin: string | null;
  lastIp: string | null;
  credits: number;
  characters: AccountCharacter[];
};

export type CharacterSummary = {
  charId: number;
  name: string;
  jobClass: number;
  jobName?: string;
  baseLevel: number;
  jobLevel: number;
  online: boolean;
  guildName: string | null;
};

export type CharacterProfile = {
  charId: number;
  accountId: number;
  slot: number;
  name: string;
  accountName: string;
  sex: string;
  jobClass: number;
  jobName?: string;
  baseLevel: number;
  jobLevel: number;
  baseExp: number;
  jobExp: number;
  zeny: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  statusPoints: number;
  skillPoints: number;
  stats: {
    str: number;
    agi: number;
    vit: number;
    int: number;
    dex: number;
    luk: number;
  };
  online: boolean;
  guild: {
    id: number | null;
    name: string | null;
    position: string | null;
    tax: number;
  };
  party: {
    id: number | null;
    name: string | null;
    leaderName: string | null;
    members: CharacterSummary[];
  };
  family: {
    partnerName: string | null;
    childName: string | null;
    motherName: string | null;
    fatherName: string | null;
  };
  pet: {
    name: string | null;
    monsterName: string | null;
  };
  homunculus: {
    name: string | null;
    className: string | null;
  };
  deathCount: number;
  friends: CharacterSummary[];
  inventory: InventoryItem[];
};

export type CharacterRankingEntry = {
  rank: number;
  charId: number;
  name: string;
  jobClass: number;
  jobName: string;
  baseLevel: number;
  jobLevel: number;
  baseExp: number;
  jobExp: number;
  guildId: number | null;
  guildName: string | null;
};

export type GuildRankingEntry = {
  rank: number;
  guildId: number;
  name: string;
  guildLevel: number;
  castles: number;
  members: number;
  averageLevel: number;
  experience: number;
};

export type GuildRelation = {
  guildId: number;
  name: string | null;
};

export type GuildMember = {
  accountId: number;
  charId: number;
  name: string;
  jobClass: number;
  jobName: string;
  baseLevel: number;
  jobLevel: number;
  devotion: number;
  position: number;
  positionName: string | null;
  rights: string;
  tax: number;
  lastLogin: string;
};

export type GuildCastle = {
  castleId: number;
  name: string;
};

export type GuildProfile = {
  guildId: number;
  name: string;
  leaderCharId: number;
  leaderName: string | null;
  guildLevel: number;
  onlineMembers: number;
  maxMembers: number;
  averageLevel: number;
  experience: number;
  nextExperience: number;
  skillPoints: number;
  message1: string | null;
  message2: string | null;
  emblemId: number;
  alliances: GuildRelation[];
  oppositions: GuildRelation[];
  members: GuildMember[];
  castles: GuildCastle[];
  storage: InventoryItem[];
};

export type ItemListEntry = {
  itemId: number;
  identifier: string;
  name: string;
  type: string | null;
  subtype: string | null;
  priceBuy: number;
  priceSell: number;
  weight: number;
  attack: number;
  defense: number;
  range: number;
  slots: number;
  refineable: boolean;
  custom: boolean;
};

export type ItemDropEntry = {
  monsterId: number;
  monsterName: string;
  monsterLevel: number;
  monsterRace: string;
  monsterElement: string;
  canSteal: boolean;
  dropRate: number;
  isMvp: boolean;
};

export type ItemProfile = {
  itemId: number;
  identifier: string;
  name: string;
  type: string | null;
  subtype: string | null;
  priceBuy: number;
  priceSell: number;
  weight: number;
  attack: number;
  defense: number;
  range: number;
  slots: number;
  weaponLevel: number;
  equipLevelMin: number;
  equipLevelMax: number;
  magicAttack: number;
  refineable: boolean;
  custom: boolean;
  equipJobs: string[];
  equipUpper: string[];
  equipLocations: string[];
  gender: string | null;
  tradeRestrictions: string[];
  script: string | null;
  equipScript: string | null;
  unequipScript: string | null;
  drops: ItemDropEntry[];
};

export type MonsterListEntry = {
  monsterId: number;
  nameEnglish: string;
  nameJapanese: string;
  level: number;
  hp: number;
  size: string;
  race: string;
  element: string;
  baseExp: number;
  jobExp: number;
  isMvp: boolean;
  custom: boolean;
};

export type MonsterItemDrop = {
  itemId: number;
  itemName: string;
  canSteal: boolean;
  chance: number;
  isMvp: boolean;
};

export type MonsterSkill = {
  name: string;
  level: number;
  state: string;
  rate: number;
  castTime: number;
  delay: number;
  cancelable: string;
  target: string;
  condition: string;
  conditionValue: string | null;
};

export type MonsterProfile = {
  monsterId: number;
  sprite: string;
  nameEnglish: string;
  nameJapanese: string;
  level: number;
  hp: number;
  sp: number;
  size: string;
  race: string;
  element: string;
  elementLevel: number;
  baseExp: number;
  jobExp: number;
  mvpExp: number;
  attack: number;
  attack2: number;
  defense: number;
  magicDefense: number;
  attackRange: number;
  skillRange: number;
  chaseRange: number;
  walkSpeed: number;
  attackDelay: number;
  attackMotion: number;
  damageMotion: number;
  stats: {
    str: number;
    agi: number;
    vit: number;
    int: number;
    dex: number;
    luk: number;
  };
  isMvp: boolean;
  custom: boolean;
  mode: string[];
  drops: MonsterItemDrop[];
  skills: MonsterSkill[];
};
