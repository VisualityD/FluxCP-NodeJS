export const ACCOUNT_LEVELS = {
  ANYONE: -2,
  UNAUTH: -1,
  NORMAL: 0,
  LOWGM: 1,
  HIGHGM: 2,
  ADMIN: 99
} as const;

const GROUPS: Record<number, { name: string; level: number }> = {
  0: { name: "Player", level: ACCOUNT_LEVELS.NORMAL },
  1: { name: "Super Player", level: ACCOUNT_LEVELS.NORMAL },
  2: { name: "Support", level: ACCOUNT_LEVELS.LOWGM },
  3: { name: "Script Manager", level: ACCOUNT_LEVELS.LOWGM },
  4: { name: "Event Manager", level: ACCOUNT_LEVELS.LOWGM },
  5: { name: "VIP", level: ACCOUNT_LEVELS.NORMAL },
  10: { name: "Law Enforcement", level: ACCOUNT_LEVELS.HIGHGM },
  99: { name: "Admin", level: ACCOUNT_LEVELS.ADMIN }
};

export function getGroupLevel(groupId: number): number {
  return GROUPS[groupId]?.level ?? ACCOUNT_LEVELS.NORMAL;
}

export function getGroupName(groupId: number): string {
  return GROUPS[groupId]?.name ?? "N/A";
}
