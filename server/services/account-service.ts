import type { RowDataPacket } from "mysql2";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getGroupName } from "../lib/account-level.js";
import type { SessionUser } from "../lib/session.js";
import type { AccountProfile } from "../../src/types.js";
import { getJobName } from "../lib/jobs.js";

type AccountRow = RowDataPacket & {
  account_id: number;
  userid: string;
  email: string | null;
  group_id: number;
  state: number;
  sex: string;
  logincount: number;
  birthdate: string | null;
  lastlogin: string | null;
  last_ip: string | null;
  balance: number | null;
};

type CharacterRow = RowDataPacket & {
  char_id: number;
  name: string;
  class: number;
  base_level: number;
  job_level: number;
  zeny: number;
  online: number;
};

export async function getMyAccountProfile(user: SessionUser): Promise<AccountProfile | null> {
  const loginPool = getPool(runtimeConfig.loginDatabase);
  const charPool = getPool(runtimeConfig.charDatabase);

  const [accountRows] = await loginPool.query<AccountRow[]>(
    `SELECT login.account_id, login.userid, login.email, login.group_id, login.state, login.sex, login.logincount, login.birthdate, login.lastlogin, login.last_ip, credits.balance
     FROM \`login\` AS login
     LEFT JOIN \`${runtimeConfig.creditsTable}\` AS credits ON credits.account_id = login.account_id
     WHERE login.account_id = ?
     LIMIT 1`,
    [user.accountId]
  );

  const account = accountRows[0];
  if (!account) {
    return null;
  }

  const [characterRows] = await charPool.query<CharacterRow[]>(
    "SELECT char_id, name, class, base_level, job_level, zeny, online FROM `char` WHERE account_id = ? ORDER BY char_num ASC",
    [user.accountId]
  );

  return {
    accountId: account.account_id,
    username: account.userid,
    email: account.email,
    groupId: account.group_id,
    groupName: getGroupName(account.group_id),
    state: account.state,
    sex: account.sex,
    loginCount: account.logincount,
    birthdate: account.birthdate,
    lastLogin: account.lastlogin,
    lastIp: account.last_ip,
    credits: Number(account.balance ?? 0),
    characters: characterRows.map((character) => ({
      charId: character.char_id,
      name: character.name,
      jobClass: character.class,
      jobName: getJobName(character.class),
      baseLevel: character.base_level,
      jobLevel: character.job_level,
      zeny: character.zeny,
      online: character.online > 0
    }))
  };
}
