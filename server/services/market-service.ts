import type { RowDataPacket } from "mysql2";
import type {
  BuyingStore,
  BuyingStoreItem,
  BuyingStoreSummary,
  VendingItem,
  VendingShop,
  VendingSummary
} from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getExistingTables, getTableColumns } from "../lib/schema.js";

type ShopRow = RowDataPacket & {
  id: number;
  account_id?: number | null;
  char_id: number | null;
  char_name: string | null;
  sex: string | null;
  map: string | null;
  x: number | null;
  y: number | null;
  title: string | null;
  autotrade: number | null;
};

type VendingItemRow = RowDataPacket & {
  cartinventory_id: number;
  amount: number;
  price: number;
  nameid: number;
  refine: number | null;
  item_name: string | null;
  slots: number | null;
  card0: number | null;
  card1: number | null;
  card2: number | null;
  card3: number | null;
  option_id0: number | null;
  option_val0: number | null;
  option_id1: number | null;
  option_val1: number | null;
  option_id2: number | null;
  option_val2: number | null;
  option_id3: number | null;
  option_val3: number | null;
  option_id4: number | null;
  option_val4: number | null;
};

type BuyingStoreItemRow = RowDataPacket & {
  item_id: number;
  item_name: string | null;
  amount: number;
  price: number;
};

type CardRow = RowDataPacket & {
  id: number;
  name_english: string;
};

let cachedItemTableName: string | null | undefined;
let cachedCartOptionSelect: string | undefined;

async function resolveItemTableName(): Promise<string | null> {
  if (cachedItemTableName !== undefined) {
    return cachedItemTableName;
  }

  const tables = await getExistingTables(runtimeConfig.charDatabase, [
    "items",
    "item_db_re",
    "item_db",
    "item_db2_re",
    "item_db2"
  ]);

  const ordered = ["items", "item_db_re", "item_db", "item_db2_re", "item_db2"];
  cachedItemTableName = ordered.find((name) => tables.has(name)) ?? null;
  return cachedItemTableName;
}

async function buildCartOptionSelect(): Promise<string> {
  if (cachedCartOptionSelect !== undefined) {
    return cachedCartOptionSelect;
  }

  const columns = await getTableColumns(runtimeConfig.charDatabase, "cart_inventory");
  const optionColumns = [
    "option_id0",
    "option_val0",
    "option_id1",
    "option_val1",
    "option_id2",
    "option_val2",
    "option_id3",
    "option_val3",
    "option_id4",
    "option_val4"
  ];

  cachedCartOptionSelect = optionColumns
    .map((name) => (columns.has(name) ? `, cart_inventory.${name}` : `, NULL AS ${name}`))
    .join("");
  return cachedCartOptionSelect;
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

  const names = new Map(cardIds.map((id) => [id, `Card #${id}`]));
  for (const row of rows) {
    names.set(row.id, row.name_english);
  }
  return names;
}

function mapShopRow(row: ShopRow): VendingSummary {
  return {
    id: row.id,
    charId: row.char_id ?? null,
    charName: row.char_name || "Unknown",
    sex: row.sex || "?",
    map: row.map || "Unknown",
    x: Number(row.x ?? 0),
    y: Number(row.y ?? 0),
    title: row.title || "",
    autotrade: Number(row.autotrade ?? 0) > 0
  };
}

function mapBuyingStoreRow(row: ShopRow): BuyingStoreSummary {
  return {
    id: row.id,
    charId: row.char_id ?? null,
    charName: row.char_name || "Unknown",
    sex: row.sex || "?",
    map: row.map || "Unknown",
    x: Number(row.x ?? 0),
    y: Number(row.y ?? 0),
    title: row.title || "",
    autotrade: Number(row.autotrade ?? 0) > 0
  };
}

function mapOptionStrings(row: VendingItemRow): string[] {
  const options: string[] = [];
  for (let index = 0; index <= 4; index += 1) {
    const optionId = row[`option_id${index}` as keyof VendingItemRow];
    const optionValue = row[`option_val${index}` as keyof VendingItemRow];
    const id = Number(optionId ?? 0);
    if (id > 0) {
      const value = Number(optionValue ?? 0);
      options.push(value > 0 ? `Option ${id} +${value}` : `Option ${id}`);
    }
  }
  return options;
}

function mapVendingItems(rows: VendingItemRow[], cardNames: Map<number, string>): VendingItem[] {
  return rows.map((row) => ({
    cartInventoryId: row.cartinventory_id,
    itemId: row.nameid,
    itemName: row.item_name || `Item #${row.nameid}`,
    refine: Number(row.refine ?? 0),
    slots: Number(row.slots ?? 0),
    cards: [row.card0, row.card1, row.card2, row.card3]
      .filter((value): value is number => Number(value) > 0 && value !== 254 && value !== 255)
      .map((value) => cardNames.get(value) ?? `Card #${value}`),
    options: mapOptionStrings(row),
    price: Number(row.price ?? 0),
    amount: Number(row.amount ?? 0)
  }));
}

function mapBuyingStoreItems(rows: BuyingStoreItemRow[]): BuyingStoreItem[] {
  return rows.map((row) => ({
    itemId: row.item_id,
    itemName: row.item_name || `Item #${row.item_id}`,
    price: Number(row.price ?? 0),
    amount: Number(row.amount ?? 0)
  }));
}

export async function getVendingList(): Promise<VendingSummary[]> {
  const tables = await getExistingTables(runtimeConfig.charDatabase, ["vendings", "char"]);
  if (!tables.has("vendings")) {
    return [];
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const [rows] = await pool.query<ShopRow[]>(
    `SELECT ch.name AS char_name, vendings.id, vendings.char_id, vendings.sex, vendings.map, vendings.x, vendings.y, vendings.title, vendings.autotrade
     FROM vendings
     LEFT JOIN \`char\` AS ch ON vendings.char_id = ch.char_id
     ORDER BY vendings.id ASC`
  );

  return rows.map(mapShopRow);
}

export async function getVendingShop(id: number): Promise<VendingShop | null> {
  const tables = await getExistingTables(runtimeConfig.charDatabase, ["vendings", "vending_items", "cart_inventory", "char"]);
  if (!tables.has("vendings") || !tables.has("vending_items") || !tables.has("cart_inventory")) {
    return null;
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const [shopRows] = await pool.query<ShopRow[]>(
    `SELECT ch.name AS char_name, vendings.id, vendings.account_id, vendings.char_id, vendings.sex, vendings.map, vendings.x, vendings.y, vendings.title, vendings.autotrade
     FROM vendings
     LEFT JOIN \`char\` AS ch ON vendings.char_id = ch.char_id
     WHERE vendings.id = ?
     LIMIT 1`,
    [id]
  );

  const shop = shopRows[0];
  if (!shop) {
    return null;
  }

  const itemTable = await resolveItemTableName();
  const optionSelect = await buildCartOptionSelect();
  const itemJoin = itemTable
    ? `LEFT JOIN \`${itemTable}\` AS items ON cart_inventory.nameid = items.id`
    : "";
  const itemNameSelect = itemTable ? "items.name_english AS item_name, items.slots" : "NULL AS item_name, 0 AS slots";

  const [itemRows] = await pool.query<VendingItemRow[]>(
    `SELECT vending_items.cartinventory_id, vending_items.amount, vending_items.price,
            cart_inventory.nameid, cart_inventory.refine, cart_inventory.card0, cart_inventory.card1, cart_inventory.card2, cart_inventory.card3,
            ${itemNameSelect}
            ${optionSelect}
     FROM vending_items
     LEFT JOIN cart_inventory ON vending_items.cartinventory_id = cart_inventory.id
     ${itemJoin}
     WHERE vending_items.vending_id = ?
     ORDER BY vending_items.cartinventory_id ASC`,
    [id]
  );

  const cardIds = Array.from(
    new Set(
      itemRows.flatMap((row) => [row.card0, row.card1, row.card2, row.card3]).filter((value): value is number => Number(value) > 0 && value !== 254 && value !== 255)
    )
  );
  const cardNames = await resolveCardNames(cardIds);

  return {
    id: shop.id,
    accountId: "account_id" in shop ? (shop.account_id ?? null) : null,
    charId: shop.char_id ?? null,
    charName: shop.char_name || "Unknown",
    sex: shop.sex || "?",
    map: shop.map || "Unknown",
    x: Number(shop.x ?? 0),
    y: Number(shop.y ?? 0),
    title: shop.title || "",
    autotrade: Number(shop.autotrade ?? 0) > 0,
    items: mapVendingItems(itemRows, cardNames)
  };
}

export async function getBuyingStoreList(): Promise<BuyingStoreSummary[]> {
  const tables = await getExistingTables(runtimeConfig.charDatabase, ["buyingstores", "char"]);
  if (!tables.has("buyingstores")) {
    return [];
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const [rows] = await pool.query<ShopRow[]>(
    `SELECT ch.name AS char_name, buyingstores.id, buyingstores.char_id, buyingstores.sex, buyingstores.map, buyingstores.x, buyingstores.y, buyingstores.title, buyingstores.autotrade
     FROM buyingstores
     LEFT JOIN \`char\` AS ch ON buyingstores.char_id = ch.char_id
     ORDER BY buyingstores.id ASC`
  );

  return rows.map(mapBuyingStoreRow);
}

export async function getBuyingStoreShop(id: number): Promise<BuyingStore | null> {
  const tables = await getExistingTables(runtimeConfig.charDatabase, ["buyingstores", "buyingstore_items", "char"]);
  if (!tables.has("buyingstores") || !tables.has("buyingstore_items")) {
    return null;
  }

  const pool = getPool(runtimeConfig.charDatabase);
  const [shopRows] = await pool.query<ShopRow[]>(
    `SELECT ch.name AS char_name, buyingstores.id, buyingstores.char_id, buyingstores.sex, buyingstores.map, buyingstores.x, buyingstores.y, buyingstores.title, buyingstores.autotrade
     FROM buyingstores
     LEFT JOIN \`char\` AS ch ON buyingstores.char_id = ch.char_id
     WHERE buyingstores.id = ?
     LIMIT 1`,
    [id]
  );

  const shop = shopRows[0];
  if (!shop) {
    return null;
  }

  const itemTable = await resolveItemTableName();
  const itemJoin = itemTable
    ? `LEFT JOIN \`${itemTable}\` AS items ON buyingstore_items.item_id = items.id`
    : "";
  const itemNameSelect = itemTable ? "items.name_english AS item_name" : "NULL AS item_name";

  const [itemRows] = await pool.query<BuyingStoreItemRow[]>(
    `SELECT buyingstore_items.item_id, buyingstore_items.amount, buyingstore_items.price,
            ${itemNameSelect}
     FROM buyingstore_items
     ${itemJoin}
     WHERE buyingstore_items.buyingstore_id = ?
     ORDER BY buyingstore_items.\`index\` ASC`,
    [id]
  );

  return {
    id: shop.id,
    charId: shop.char_id ?? null,
    charName: shop.char_name || "Unknown",
    sex: shop.sex || "?",
    map: shop.map || "Unknown",
    x: Number(shop.x ?? 0),
    y: Number(shop.y ?? 0),
    title: shop.title || "",
    autotrade: Number(shop.autotrade ?? 0) > 0,
    items: mapBuyingStoreItems(itemRows)
  };
}
