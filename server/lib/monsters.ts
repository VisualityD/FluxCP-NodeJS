const MONSTER_SIZE_NAMES: Record<number, string> = {
  0: "Small",
  1: "Medium",
  2: "Large"
};

const MONSTER_RACE_NAMES: Record<number, string> = {
  0: "Formless",
  1: "Undead",
  2: "Brute",
  3: "Plant",
  4: "Insect",
  5: "Fish",
  6: "Demon",
  7: "Demi-Human",
  8: "Angel",
  9: "Dragon"
};

const ELEMENT_NAMES: Record<number, string> = {
  0: "Neutral",
  1: "Water",
  2: "Earth",
  3: "Fire",
  4: "Wind",
  5: "Poison",
  6: "Holy",
  7: "Dark",
  8: "Ghost",
  9: "Undead"
};

export function getMonsterSizeName(size: number): string {
  return MONSTER_SIZE_NAMES[size] ?? `Size ${size}`;
}

export function getMonsterRaceName(race: number): string {
  return MONSTER_RACE_NAMES[race] ?? `Race ${race}`;
}

export function getElementName(element: number): string {
  return ELEMENT_NAMES[element] ?? `Element ${element}`;
}
