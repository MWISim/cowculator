import * as MagicNumbers from "./MagicNumbers";

/**
 * Returns the amount of time, in seconds, that the given action will take.
 * @param baseTimeCost The base time of the action being performed
 * @param toolBonus The bonus of the tool the user is... using...
 */
export const getActionSeconds = (baseTimeCost: number, toolBonus: number | "") => {
  return Math.max(3, baseTimeCost / 1000000000 / (1 + (toolBonus || 0) / 100));
};

/**
 * Returns a list of teas that are usable in the given action
 * @param data The ApiData the app currently has loaded
 * @param actionType The hrid of the action being performed
 */
export const getAvailableTeas = (data: object, actionType: string) => {
  return Object.values(data.itemDetails).filter(x => x.consumableDetail.usableInActionTypeMap?.[actionType]).map(x => ({label: x.name, value: x.hrid}))
}

export const getTeaBonuses = (teas: string[], skill: Skill | null) => {
  const artisanTeaBonus = teas.some((x) => x === "/items/artisan_tea") ? MagicNumbers.ARTISAN_TEA_BONUS : 1;
  const wisdomTeaBonus = teas.some((x) => x === "/items/wisdom_tea") ? MagicNumbers.WISDOM_TEA_BONUS : 1;
  const gourmetTeaBonus = teas.some((x) => x === "/items/gourmet_tea") ? MagicNumbers.GOURMET_TEA_BONUS : 1;
  const blessedTeaBonus = teas.some((x) => x === "/items/blessed_tea") ? MagicNumbers.BLESSED_TEA_BONUS : 0;
  const gatheringTeaBonus = teas.some((x) => x === "/items/gathering_tea") ? MagicNumbers.GATHERING_TEA_BONUS : 1;
  const efficiencyTeaBonus = teas.some((x) => x === "/items/efficiency_tea") ? MagicNumbers.EFFICIENCY_TEA_BONUS : 0;
  const levelTeaBonus = skill && teas.some((x) => x === `/items/super_${skill}_tea`) ? MagicNumbers.SUPER_LEVEL_TEA_BONUS : (
    skill && teas.some((x) => x === `/items/${skill}_tea`) ? MagicNumbers.LEVEL_TEA_BONUS : 0
  );
  const teaError = teas.filter((x) => x.includes(`${skill}_tea`)).length > 1 ? `Cannot use both ${skill} teas.` : null;

  return {
    teaError,
    wisdomTeaBonus,
    artisanTeaBonus,
    gourmetTeaBonus,
    blessedTeaBonus,
    levelTeaBonus,
    gatheringTeaBonus,
    efficiencyTeaBonus,
  };
};

export const getApproxValue = (hrid: string, priceOverrides: object, data: object): number => {
  // Coins are always 1, and if there's an override we always use that
  if (hrid === "/items/coin") return 1;
  if (priceOverrides[hrid]) return +priceOverrides[hrid];

  const item = data.itemDetails[hrid];

  // If there's no bid/ask, just use the sellPrice. This is dumb but oh well...
  if (item.ask === -1 && item.bid === -1) return item.sellPrice;

  // If no bid or ask, use the other one
  if (item.ask === -1) return item.bid;
  if (item.bid === -1) return item.ask;

  // If there is a bid + ask, then average them. Also dumb, but close enough?
  return +((item.ask + item.bid) / 2).toFixed(0);
};

export enum Skill {
  Brewing = "brewing",
  Cheesesmithing = "cheesesmithing",
  Cooking = "cooking",
  Crafting = "crafting",
  Enhancing = "enhancing",
  Foraging = "foraging",
  Milking = "milking",
  Tailoring = "tailoring",
  Woodcutting = "woodcutting",
}
