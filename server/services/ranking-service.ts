import type { RowDataPacket } from "mysql2";
import type { CharacterRankingEntry, GuildRankingEntry } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getJobName } from "../lib/jobs.js";

type CharacterRankRow = RowDataPacket & {
  char_id: number;
  char_name: string;
  char_class: number;
  base_level: number;
  base_exp: number;
  job_level: number;
  job_exp: number;
  guild_id: number | null;
  guild_name: string | null;
};

type GuildRankRow = RowDataPacket & {
  guild_id: number;
  name: string;
  guild_lv: number;
  average_lv: number;
  exp: number;
  members: number;
  castles: number;
};

export async function getCharacterRanking(jobClass?: number | null): Promise<CharacterRankingEntry[]> {
  const pool = getPool(runtimeConfig.charDatabase);
  const bind: Array<number> = [];

  let sql = `
    SELECT
      ch.char_id,
      ch.name AS char_name,
      ch.class AS char_class,
      ch.base_level,
      ch.base_exp,
      ch.job_level,
      ch.job_exp,
      ch.guild_id,
      guild.name AS guild_name
    FROM \`char\` AS ch
    LEFT JOIN \`guild\` ON guild.guild_id = ch.guild_id
    WHERE 1=1
  `;

  if (typeof jobClass === "number") {
    sql += " AND ch.class = ? ";
    bind.push(jobClass);
  }

  sql += `
    ORDER BY ch.base_level DESC, ch.base_exp DESC, ch.job_level DESC, ch.job_exp DESC, ch.char_id ASC
    LIMIT ${runtimeConfig.charRankingLimit}
  `;

  const [rows] = await pool.query<CharacterRankRow[]>(sql, bind);
  return rows.map((row, index) => ({
    rank: index + 1,
    charId: row.char_id,
    name: row.char_name,
    jobClass: row.char_class,
    jobName: getJobName(row.char_class),
    baseLevel: row.base_level,
    jobLevel: row.job_level,
    baseExp: row.base_exp,
    jobExp: row.job_exp,
    guildId: row.guild_id,
    guildName: row.guild_name
  }));
}

export async function getGuildRanking(): Promise<GuildRankingEntry[]> {
  const pool = getPool(runtimeConfig.charDatabase);
  const sql = `
    SELECT
      g.guild_id,
      g.name,
      g.guild_lv,
      g.average_lv,
      GREATEST(g.exp, IFNULL((SELECT SUM(exp) FROM guild_member WHERE guild_member.guild_id = g.guild_id), 0)) AS exp,
      (SELECT COUNT(char_id) FROM \`char\` WHERE \`char\`.guild_id = g.guild_id) AS members,
      (SELECT COUNT(castle_id) FROM guild_castle WHERE guild_castle.guild_id = g.guild_id) AS castles
    FROM guild AS g
    ORDER BY g.guild_lv DESC, castles DESC, exp DESC, (g.average_lv + members) DESC, g.average_lv DESC, members DESC, g.max_member DESC, g.next_exp ASC
    LIMIT ${runtimeConfig.guildRankingLimit}
  `;

  const [rows] = await pool.query<GuildRankRow[]>(sql);
  return rows.map((row, index) => ({
    rank: index + 1,
    guildId: row.guild_id,
    name: row.name,
    guildLevel: row.guild_lv,
    castles: row.castles,
    members: row.members,
    averageLevel: row.average_lv,
    experience: row.exp
  }));
}
