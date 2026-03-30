import type { RowDataPacket } from "mysql2";
import type { ServerStatus } from "../../src/types.js";
import { runtimeConfig } from "../config/runtime.js";
import { getMockStatus } from "../data/mock.js";
import { getPool } from "../lib/database.js";
import { isTcpEndpointUp } from "../lib/net.js";

type CountRow = RowDataPacket & {
  players_online: number;
};

type PeakRow = RowDataPacket & {
  users: number;
};

export async function getServerStatus(): Promise<ServerStatus[]> {
  try {
    const pool = getPool(runtimeConfig.charDatabase);
    const [onlineRows] = await pool.query<CountRow[]>(
      "SELECT COUNT(char_id) AS players_online FROM `char` WHERE `online` > 0"
    );
    const [peakRows] = await pool.query<PeakRow[]>(
      `SELECT users FROM \`${runtimeConfig.onlinePeakTable}\` ORDER BY users DESC LIMIT 1`
    );

    const [loginServerUp, charServerUp, mapServerUp] = await Promise.all([
      isTcpEndpointUp(runtimeConfig.loginServer.host, runtimeConfig.loginServer.port),
      isTcpEndpointUp(runtimeConfig.charServer.host, runtimeConfig.charServer.port),
      isTcpEndpointUp(runtimeConfig.mapServer.host, runtimeConfig.mapServer.port)
    ]);

    return [
      {
        groupName: runtimeConfig.serverName,
        serverName: runtimeConfig.serverName,
        loginServerUp,
        charServerUp,
        mapServerUp,
        playersOnline: Number(onlineRows[0]?.players_online ?? 0),
        playersPeak: Number(peakRows[0]?.users ?? 0)
      }
    ];
  } catch {
    return getMockStatus();
  }
}
