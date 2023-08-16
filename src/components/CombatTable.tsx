import { useState } from "react";
import { getFriendlyIntString } from "../helpers/Formatting";
import { ItemDetail } from "../models/Client";
import { MarketValue } from "../models/Market";
import { ApiData } from "../services/ApiService";
import { Flex, NumberInput, Table } from "@mantine/core";
import Icon from "./Icon";

interface MonsterSpawnOverride {
  combatMonsterHrid: string;
  rate: number;
}

const planetSpawnRates: { [key: string]: MonsterSpawnOverride[] } = {
  "/actions/combat/smelly_planet": [
    {
      combatMonsterHrid: "/combat_monsters/fly",
      rate: 0.743865,
    },
    {
      combatMonsterHrid: "/combat_monsters/rat",
      rate: 0.711656,
    },
    {
      combatMonsterHrid: "/combat_monsters/skunk",
      rate: 0.67229,
    },
    {
      combatMonsterHrid: "/combat_monsters/porcupine",
      rate: 0.630879,
    },
    {
      combatMonsterHrid: "/combat_monsters/slimy",
      rate: 0.5864,
    },
  ],
  "/actions/combat/swamp_planet": [
    {
      combatMonsterHrid: "/combat_monsters/frog",
      rate: 0.891993,
    },
    {
      combatMonsterHrid: "/combat_monsters/snake",
      rate: 0.888217,
    },
    {
      combatMonsterHrid: "/combat_monsters/swampy",
      rate: 0.774169,
    },
    {
      combatMonsterHrid: "/combat_monsters/alligator",
      rate: 0.715256,
    },
  ],
  "/actions/combat/aqua_planet": [
    {
      combatMonsterHrid: "/combat_monsters/sea_snail",
      rate: 0.739628,
    },
    {
      combatMonsterHrid: "/combat_monsters/crab",
      rate: 0.668097,
    },
    {
      combatMonsterHrid: "/combat_monsters/aquahorse",
      rate: 0.656652,
    },
    {
      combatMonsterHrid: "/combat_monsters/nom_nom",
      rate: 0.655221,
    },
    {
      combatMonsterHrid: "/combat_monsters/turtle",
      rate: 0.560801,
    },
  ],
  "/actions/combat/jungle_planet": [
    {
      combatMonsterHrid: "/combat_monsters/jungle_sprite",
      rate: 0.82931,
    },
    {
      combatMonsterHrid: "/combat_monsters/myconid",
      rate: 0.772413,
    },
    {
      combatMonsterHrid: "/combat_monsters/treant",
      rate: 0.715517,
    },
    {
      combatMonsterHrid: "/combat_monsters/centaur_archer",
      rate: 0.660344,
    },
  ],
  "/actions/combat/gobo_planet": [
    {
      combatMonsterHrid: "/combat_monsters/gobo_stabby",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/combat_monsters/gobo_slashy",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/combat_monsters/gobo_smashy",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/combat_monsters/gobo_shooty",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/combat_monsters/gobo_boomy",
      rate: 0.4,
    },
  ],
  "/actions/combat/bear_with_it": [
    {
      combatMonsterHrid: "/combat_monsters/gummy_bear",
      rate: 0.587196,
    },
    {
      combatMonsterHrid: "/combat_monsters/panda",
      rate: 0.479028,
    },
    {
      combatMonsterHrid: "/combat_monsters/black_bear",
      rate: 0.514348,
    },
    {
      combatMonsterHrid: "/combat_monsters/grizzly_bear",
      rate: 0.485651,
    },
    {
      combatMonsterHrid: "/combat_monsters/polar_bear",
      rate: 0.450331,
    },
  ],
  "/actions/combat/golem_cave": [
    {
      combatMonsterHrid: "/combat_monsters/magnetic_golem",
      rate: 0.88421,
    },
    {
      combatMonsterHrid: "/combat_monsters/stalactite_golem",
      rate: 0.778947,
    },
    {
      combatMonsterHrid: "/combat_monsters/granite_golem",
      rate: 0.705263,
    },
  ],
  "/actions/combat/sorcerers_tower": [
    {
      combatMonsterHrid: "/combat_monsters/novice_sorcerer",
      rate: 0.96124,
    },
    {
      combatMonsterHrid: "/combat_monsters/ice_sorcerer",
      rate: 0.89664,
    },
    {
      combatMonsterHrid: "/combat_monsters/flame_sorcerer",
      rate: 0.899224,
    },
    {
      combatMonsterHrid: "/combat_monsters/elementalist",
      rate: 0.749354,
    },
  ],
  "/actions/combat/planet_of_the_eyes": [
    {
      combatMonsterHrid: "/combat_monsters/eye",
      rate: 0.888691,
    },
    {
      combatMonsterHrid: "/combat_monsters/eyes",
      rate: 0.778235,
    },
    {
      combatMonsterHrid: "/combat_monsters/veyes",
      rate: 0.703626,
    },
  ],
  "/actions/combat/twilight_zone": [
    {
      combatMonsterHrid: "/combat_monsters/zombie",
      rate: 0.875862,
    },
    {
      combatMonsterHrid: "/combat_monsters/vampire",
      rate: 0.786206,
    },
    {
      combatMonsterHrid: "/combat_monsters/werewolf",
      rate: 0.703448,
    },
  ],
};

type LootData = {
  itemHrid: string;
  itemName: string;
  dropsPerHour: number;
  coinPerItem: number;
  coinPerHour: number;
};

interface Props {
  data: ApiData;
  action: string;
  kph: number;
}

export default function CombatTable({ action, data, kph }: Props) {
  const [priceOverrides, setPriceOverrides] = useState<{
    [key: string]: number | "";
  }>({});
  const enemies =
    planetSpawnRates[action] ??
    data.actionDetails[action].monsterSpawnInfo.spawns ??
    [];

  const encounterRows = enemies.map((x) => {
    const monster = data.combatMonsterDetails[x.combatMonsterHrid];
    return (
      <tr key={action + "/encounterRate/" + x.combatMonsterHrid}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.combatMonsterHrid} /> {monster.name}
          </Flex>
        </td>
        <td>{x.rate}</td>
      </tr>
    );
  });

  const getItemPrice = (item: MarketValue & ItemDetail): number => {
    if (item.hrid === "/items/coin") return 1;

    return priceOverrides[item.hrid] || Math.round((item.ask + item.bid) / 2);
  };

  const lootMap = enemies
    .flatMap((x) => {
      const dropTable =
        data.combatMonsterDetails[x.combatMonsterHrid].dropTable;

      return dropTable.map((y) => {
        const item = data.itemDetails[y.itemHrid];

        const avgDrop = (y.minCount + y.maxCount) / 2;
        const avgDropPerKill = y.dropRate * avgDrop;
        const dropsPerHour = avgDropPerKill * kph * x.rate;
        const coinPerItem = getItemPrice(item);
        const coinPerHour = coinPerItem * dropsPerHour;

        return {
          itemHrid: item.hrid,
          itemName: item.name,
          dropsPerHour,
          coinPerItem,
          coinPerHour,
        } as LootData;
      });
    })
    .reduce((acc, val) => {
      const temp = acc.get(val.itemHrid);
      if (temp) {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerHour: val.dropsPerHour + temp.dropsPerHour,
          coinPerItem: val.coinPerItem,
          coinPerHour: val.coinPerHour + temp.coinPerHour,
        });
      } else {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerHour: val.dropsPerHour,
          coinPerItem: val.coinPerItem,
          coinPerHour: val.coinPerHour,
        });
      }

      return acc;
    }, new Map<string, LootData>());

  const lootData = Array.from(lootMap.values());

  const lootRows = lootData.map((x, i) => {
    return (
      <tr key={`${action}/loot/${i}/${x.itemHrid}`}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.itemHrid} /> {x.itemName}
          </Flex>
        </td>
        <td>{getFriendlyIntString(x.dropsPerHour, 2)}</td>
        <td>
          <NumberInput
            hideControls
            value={priceOverrides[x.itemHrid]}
            placeholder={x.coinPerItem.toString()}
            disabled={x.itemHrid === "/items/coin"}
            onChange={(y) =>
              setPriceOverrides({
                ...priceOverrides,
                [x.itemHrid]: y,
              })
            }
          />
        </td>
        <td>{getFriendlyIntString(x.coinPerHour)}</td>
      </tr>
    );
  });

  const totalCoinsPerHour = lootData.reduce(
    (acc, val) => acc + val.coinPerHour,
    0
  );

  return (
    <>
      <Flex
        gap="sm"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        direction="row"
      >
        <Flex>
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Loot</th>
                <th>Rate/hr</th>
                <th>Price/item</th>
                <th>Coin/hr</th>
              </tr>
            </thead>
            <tbody>
              {lootRows}
              <tr>
                <th colSpan={3}>Total</th>
                <td>{getFriendlyIntString(totalCoinsPerHour)}</td>
              </tr>
            </tbody>
          </Table>
        </Flex>
      </Flex>
      <Flex>
        <Table striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>Monster</th>
              <th>Encounter Rate</th>
            </tr>
          </thead>
          <tbody>{encounterRows}</tbody>
        </Table>
      </Flex>
    </>
  );
}
