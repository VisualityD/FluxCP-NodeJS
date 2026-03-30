import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { hashMd5 } from "../lib/password.js";

type ExistingRow = RowDataPacket & {
  userid: string;
};

export type RegisterInput = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  confirmEmail: string;
  gender: string;
  birthdate: string;
};

export type RegisterResult =
  | { ok: true; accountId: number; username: string; passwordForLogin: string }
  | { ok: false; message: string; code: string };

function validate(input: RegisterInput): RegisterResult | null {
  const usernameRegex = new RegExp(`^[${runtimeConfig.usernameAllowedChars}]+$`);

  if (!usernameRegex.test(input.username)) {
    return { ok: false, message: "Username contains invalid characters.", code: "INVALID_USERNAME" };
  }
  if (input.username.length < runtimeConfig.minUsernameLength) {
    return { ok: false, message: "Username is too short.", code: "USERNAME_TOO_SHORT" };
  }
  if (input.username.length > runtimeConfig.maxUsernameLength) {
    return { ok: false, message: "Username is too long.", code: "USERNAME_TOO_LONG" };
  }
  if (input.password.length < runtimeConfig.minPasswordLength) {
    return { ok: false, message: "Password is too short.", code: "PASSWORD_TOO_SHORT" };
  }
  if (input.password.length > runtimeConfig.maxPasswordLength) {
    return { ok: false, message: "Password is too long.", code: "PASSWORD_TOO_LONG" };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, message: "Passwords do not match.", code: "PASSWORD_MISMATCH" };
  }
  if (input.email.trim() !== input.confirmEmail.trim()) {
    return { ok: false, message: "Email addresses do not match.", code: "EMAIL_MISMATCH" };
  }
  if (!/^.+@.+\..+$/.test(input.email)) {
    return { ok: false, message: "Invalid email address.", code: "INVALID_EMAIL" };
  }
  if (!["M", "F"].includes(input.gender.toUpperCase())) {
    return { ok: false, message: "Invalid gender.", code: "INVALID_GENDER" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthdate)) {
    return { ok: false, message: "Invalid birthdate.", code: "INVALID_BIRTHDATE" };
  }
  if (runtimeConfig.passwordMinUpper > 0 && (input.password.match(/[A-Z]/g)?.length ?? 0) < runtimeConfig.passwordMinUpper) {
    return { ok: false, message: "Password needs more uppercase letters.", code: "PASSWORD_NEED_UPPER" };
  }
  if (runtimeConfig.passwordMinLower > 0 && (input.password.match(/[a-z]/g)?.length ?? 0) < runtimeConfig.passwordMinLower) {
    return { ok: false, message: "Password needs more lowercase letters.", code: "PASSWORD_NEED_LOWER" };
  }
  if (runtimeConfig.passwordMinNumber > 0 && (input.password.match(/[0-9]/g)?.length ?? 0) < runtimeConfig.passwordMinNumber) {
    return { ok: false, message: "Password needs more numbers.", code: "PASSWORD_NEED_NUMBER" };
  }
  if (
    runtimeConfig.passwordMinSymbol > 0 &&
    (input.password.match(/[^A-Za-z0-9]/g)?.length ?? 0) < runtimeConfig.passwordMinSymbol
  ) {
    return { ok: false, message: "Password needs more symbols.", code: "PASSWORD_NEED_SYMBOL" };
  }

  return null;
}

function passwordForStorage(password: string): string {
  return runtimeConfig.loginUseMd5 ? hashMd5(password) : password;
}

export async function registerAccount(input: RegisterInput): Promise<RegisterResult> {
  const validationError = validate(input);
  if (validationError) {
    return validationError;
  }

  try {
    const pool = getPool(runtimeConfig.loginDatabase);
    const usernameClause = runtimeConfig.loginNoCase ? "LOWER(userid) = LOWER(?)" : "CAST(userid AS BINARY) = ?";
    const [existingRows] = await pool.query<ExistingRow[]>(
      `SELECT userid FROM \`login\` WHERE ${usernameClause} LIMIT 1`,
      [input.username]
    );

    if (existingRows[0]) {
      return { ok: false, message: "Username is already taken.", code: "USERNAME_ALREADY_TAKEN" };
    }

    const storedPassword = passwordForStorage(input.password);
    const [insertResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO `login` (userid, user_pass, email, sex, group_id, birthdate) VALUES (?, ?, ?, ?, ?, ?)",
      [input.username, storedPassword, input.email.trim(), input.gender.toUpperCase(), 0, input.birthdate]
    );

    return {
      ok: true,
      accountId: insertResult.insertId,
      username: input.username,
      passwordForLogin: input.password
    };
  } catch {
    return { ok: false, message: "Registration service is unavailable.", code: "SERVICE_ERROR" };
  }
}
