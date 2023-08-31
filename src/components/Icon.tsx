import { useMemo } from "react";
import { ICON_SIZE } from "../helpers/MagicNumbers.ts";

/**
 * List of actions, specific to foraging, that have icons located in a different sprite sheet
 */
const foragingActionExceptions = [
  "asteroid_belt",
  "olympus_mons",
  "silly_cow_valley",
  "burble_beach",
  "misty_forest",
  "shimmering_lake",
  "farmland",
];

/**
 * Returns a 30x30 pixel SVG icon for the given `hrid`
 */
export default function Icon({hrid}) {
  const imgUrl = useMemo(() => {
    const split = hrid.split("/");
    const name = split[split.length - 1];
    const type = split[1];
    if (type === "actions") {
      if (hrid.includes("/foraging/") && !foragingActionExceptions.includes(name)) {
        return `/cowculator/items_sprite.951ef1ec.svg#${name}`;
      }
      return `/cowculator/actions_sprite.cd16f1a6.svg#${name}`;
    }
    if (type === "items") {
      return `/cowculator/items_sprite.951ef1ec.svg#${name}`;
    }
    return `/cowculator/combat_monsters_sprite.0f9c0366.svg#${name}`;
  }, [hrid]);

  return (
    <svg width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`}>
      <use href={imgUrl} />
    </svg>
  );
}
