import type { RowDataPacket } from "mysql2";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getGroupLevel, getGroupName } from "../lib/account-level.js";
import { hashMd5 } from "../lib/password.js";
import type { SessionUser } from "../lib/session.js";

type LoginRow = RowDataPacket & {
  account_id: number;
  userid: string;
  user_pass: string;
  sex: string;
  group_id: number;
  state: number;
  unban_time: number;
};

export type AuthResult =
  | { ok: true; user: SessionUser & { groupName: string } }
  | { ok: false; message: string; code: string };

function resolvePassword(password: string): string {
  if (!runtimeConfig.loginUseMd5) {
    return password;
  }

  return password.length === 32 && /^[a-f0-9]{32}$/i.test(password) ? password : hashMd5(password);
}

function authErrorMessage(error: unknown): string {
  const candidate = error as { code?: string };
  if (candidate?.code === "ER_ACCESS_DENIED_ERROR") {
    return "Database access denied. Check FluxCP-nodejs/.env or legacy config/servers.php.";
  }
  if (candidate?.code === "ECONNREFUSED") {
    return "Database connection refused. Check MySQL host and port.";
  }
  return "Login service is unavailable.";
}

export async function loginWithCredentials(username: string, password: string): Promise<AuthResult> {
  if (!username.trim() || !password.trim()) {
    return { ok: false, message: "Username and password are required.", code: "VALIDATION_ERROR" };
  }

  try {
    const pool = getPool(runtimeConfig.loginDatabase);
    const resolvedPassword = resolvePassword(password);
    const usernameClause = runtimeConfig.loginNoCase ? "LOWER(userid) = LOWER(?)" : "CAST(userid AS BINARY) = ?";
    const [rows] = await pool.query<LoginRow[]>(
      `SELECT account_id, userid, user_pass, sex, group_id, state, unban_time FROM \`login\` WHERE sex != 'S' AND group_id >= 0 AND ${usernameClause} AND user_pass = ? LIMIT 1`,
      [username, resolvedPassword]
    );

    const row = rows[0];
    if (!row) {
      await writeLoginLog(null, username, resolvedPassword, 1);
      return { ok: false, message: "Invalid login credentials.", code: "INVALID_LOGIN" };
    }

    if (row.unban_time > 0 && row.unban_time > Math.floor(Date.now() / 1000)) {
      await writeLoginLog(row.account_id, username, resolvedPassword, 2);
      return { ok: false, message: "This account is temporarily banned.", code: "TEMP_BANNED" };
    }

    if (row.state === 5) {
      await writeLoginLog(row.account_id, username, resolvedPassword, 3);
      return { ok: false, message: "This account is permanently banned.", code: "PERM_BANNED" };
    }

    const user = {
      accountId: row.account_id,
      username: row.userid,
      groupId: row.group_id,
      groupLevel: getGroupLevel(row.group_id),
      serverName: runtimeConfig.serverName,
      loginDate: new Date().toISOString(),
      groupName: getGroupName(row.group_id)
    };

    await writeLoginLog(row.account_id, row.userid, resolvedPassword, null);
    return { ok: true, user };
  } catch (error) {
    return { ok: false, message: authErrorMessage(error), code: "SERVICE_ERROR" };
  }
}

async function writeLoginLog(
  accountId: number | null,
  username: string,
  password: string,
  errorCode: number | null
): Promise<void> {
  try {
    const pool = getPool(runtimeConfig.loginDatabase);
    await pool.query(
      `INSERT INTO \`${runtimeConfig.loginLogTable}\` (account_id, username, password, ip, error_code, login_date) VALUES (?, ?, ?, ?, ?, NOW())`,
      [accountId, username, password.slice(0, 32), "0.0.0.0", errorCode]
    );
  } catch {
    // Ignore logging failure to keep authentication path available.
  }
}
