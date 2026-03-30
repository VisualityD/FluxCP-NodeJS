import fs from "node:fs";
import path from "node:path";
import type { WoeSchedule, WoeTimeEntry } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatServerTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} (${DAY_NAMES[date.getDay()]})`;
}

function parseWoeEntries(block: string): WoeTimeEntry[] {
  const entries: WoeTimeEntry[] = [];
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    if (!line) {
      continue;
    }

    const match = line.match(/array\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'([^']+)'\s*\)/);
    if (!match) {
      continue;
    }

    entries.push({
      startingDay: DAY_NAMES[Number(match[1])] ?? `Day ${match[1]}`,
      startingHour: match[2],
      endingDay: DAY_NAMES[Number(match[3])] ?? `Day ${match[3]}`,
      endingHour: match[4]
    });
  }

  return entries;
}

export function getWoeSchedule(): WoeSchedule[] {
  const serversPath = path.resolve(process.cwd(), "..", "config", "servers.php");
  if (!fs.existsSync(serversPath)) {
    return [];
  }

  const content = fs.readFileSync(serversPath, "utf8");
  const serverMatches = [...content.matchAll(/'ServerName'\s*=>\s*'([^']+)'.*?'WoeDayTimes'\s*=>\s*array\(([\s\S]*?)\)\s*,\s*'WoeDisallow'/g)];

  return serverMatches
    .map((match) => ({
      serverName: match[1] || runtimeConfig.serverName,
      serverTime: formatServerTime(new Date()),
      entries: parseWoeEntries(match[2] || "")
    }))
    .filter((entry) => entry.entries.length > 0);
}
