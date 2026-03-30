type ItemTypeMap = Record<string, string>;

const ITEM_TYPE_NAMES: ItemTypeMap = {
  ammo: "Ammo",
  armor: "Armor",
  card: "Card",
  cash: "Cash Shop Reward",
  delayconsume: "Delay Consume",
  etc: "Etc",
  healing: "Healing",
  petarmor: "Pet Armor",
  petegg: "Pet Egg",
  shadowgear: "Shadow Equipment",
  usable: "Usable",
  weapon: "Weapon"
};

export function getItemTypeName(type: string | null): string | null {
  if (!type) {
    return null;
  }

  return ITEM_TYPE_NAMES[type] ?? type;
}
