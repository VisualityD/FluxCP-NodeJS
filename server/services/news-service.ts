import type { RowDataPacket } from "mysql2";
import type { NewsItem } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getPool } from "../lib/database.js";
import { getMockNews } from "../data/mock.js";

type NewsRow = RowDataPacket & {
  id: number;
  title: string;
  body: string;
  link: string | null;
  author: string | null;
  created: Date | string;
};

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  try {
    const pool = getPool(runtimeConfig.loginDatabase);
    const tableName = runtimeConfig.newsTable;
    const [rows] = await pool.query<NewsRow[]>(
      `SELECT id, title, body, link, author, created FROM \`${tableName}\` ORDER BY id DESC LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      author: row.author || "admin",
      createdAt: new Date(row.created).toISOString(),
      link: row.link || undefined
    }));
  } catch {
    return getMockNews().slice(0, limit);
  }
}
