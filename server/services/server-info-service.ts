import type { RowDataPacket } from "mysql2";
import type { JobDistributionEntry, ServerInfo } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getJobName } from "../lib/jobs.js";

type CountRow = RowDataPacket & { total: number | null };
type ClassRow = RowDataPacket & { class: number; total: number };

export async function getServerInfo(): Promise<ServerInfo> {
  const loginPool = getPool(runtimeConfig.loginDatabase);
  const charPool = getPool(runtimeConfig.charDatabase);

  const [accountsRows, charactersRows, guildRows, partyRows, zenyRows, classRows] = await Promise.all([
    loginPool.query<CountRow[]>("SELECT COUNT(account_id) AS total FROM `login` WHERE sex != 'S'"),
    charPool.query<CountRow[]>("SELECT COUNT(char_id) AS total FROM `char`"),
    charPool.query<CountRow[]>("SELECT COUNT(guild_id) AS total FROM guild"),
    charPool.query<CountRow[]>("SELECT COUNT(party_id) AS total FROM party"),
    charPool.query<CountRow[]>("SELECT SUM(zeny) AS total FROM `char`"),
    charPool.query<ClassRow[]>(
      "SELECT class, COUNT(class) AS total FROM `char` GROUP BY class ORDER BY total DESC, class ASC"
    )
  ]);

  const classDistribution: JobDistributionEntry[] = classRows[0].map((row) => ({
    jobClass: row.class,
    jobName: getJobName(row.class),
    total: Number(row.total ?? 0)
  }));

  return {
    serverName: runtimeConfig.serverName,
    accounts: Number(accountsRows[0][0]?.total ?? 0),
    characters: Number(charactersRows[0][0]?.total ?? 0),
    guilds: Number(guildRows[0][0]?.total ?? 0),
    parties: Number(partyRows[0][0]?.total ?? 0),
    zeny: Number(zenyRows[0][0]?.total ?? 0),
    classDistribution
  };
}
