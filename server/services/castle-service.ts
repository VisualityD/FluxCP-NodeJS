import type { RowDataPacket } from "mysql2";
import type { CastleInfo } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getCastleName } from "../lib/castles.js";

type CastleRow = RowDataPacket & {
  castle_id: number;
  guild_id: number | null;
  economy: number | null;
  guild_name: string | null;
};

export async function getCastleList(): Promise<CastleInfo[]> {
  const pool = getPool(runtimeConfig.charDatabase);
  const [rows] = await pool.query<CastleRow[]>(
    `SELECT castles.castle_id, castles.guild_id, castles.economy, guild.name AS guild_name
     FROM guild_castle AS castles
     LEFT JOIN guild ON guild.guild_id = castles.guild_id
     ORDER BY castles.castle_id ASC`
  );

  return rows.map((row) => ({
    castleId: row.castle_id,
    castleName: getCastleName(row.castle_id),
    guildId: row.guild_id ?? null,
    guildName: row.guild_name,
    economy: Number(row.economy ?? 0)
  }));
}
