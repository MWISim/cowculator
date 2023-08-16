import { useState } from "react";
import { getFriendlyIntString } from "../helpers/Formatting";
import { ItemDetail } from "../models/Client";
import { MarketValue } from "../models/Market";
import { ApiData } from "../services/ApiService";
import { Flex, NumberInput, Switch, Table } from "@mantine/core";
import Icon from "./Icon";

interface MonsterSpawnOverride {
  combatMonsterHrid: string;
  rate: number;
}

const planetSpawnRates: { [key: string]: MonsterSpawnOverride[] } = {
  "/actions/combat/smelly_planet": [
    {
      combatMonsterHrid: "/monsters/fly",
      rate: 0.743865,
    },
    {
      combatMonsterHrid: "/monsters/rat",
      rate: 0.711656,
    },
    {
      combatMonsterHrid: "/monsters/skunk",
      rate: 0.67229,
    },
    {
      combatMonsterHrid: "/monsters/porcupine",
      rate: 0.630879,
    },
    {
      combatMonsterHrid: "/monsters/slimy",
      rate: 0.5864,
    },
  ],
  "/actions/combat/swamp_planet": [
    {
      combatMonsterHrid: "/monsters/frog",
      rate: 0.891993,
    },
    {
      combatMonsterHrid: "/monsters/snake",
      rate: 0.888217,
    },
    {
      combatMonsterHrid: "/monsters/swampy",
      rate: 0.774169,
    },
    {
      combatMonsterHrid: "/monsters/alligator",
      rate: 0.715256,
    },
    {
      combatMonsterHrid: "/monsters/giant_shoebill",
      rate: 0.1,
    },
  ],
  "/actions/combat/aqua_planet": [
    {
      combatMonsterHrid: "/monsters/sea_snail",
      rate: 0.739628,
    },
    {
      combatMonsterHrid: "/monsters/crab",
      rate: 0.668097,
    },
    {
      combatMonsterHrid: "/monsters/aquahorse",
      rate: 0.656652,
    },
    {
      combatMonsterHrid: "/monsters/nom_nom",
      rate: 0.655221,
    },
    {
      combatMonsterHrid: "/monsters/turtle",
      rate: 0.560801,
    },
    {
      combatMonsterHrid: "/monsters/marine_huntress",
      rate: 0.1,
    },
  ],
  "/actions/combat/jungle_planet": [
    {
      combatMonsterHrid: "/monsters/jungle_sprite",
      rate: 0.82931,
    },
    {
      combatMonsterHrid: "/monsters/myconid",
      rate: 0.772413,
    },
    {
      combatMonsterHrid: "/monsters/treant",
      rate: 0.715517,
    },
    {
      combatMonsterHrid: "/monsters/centaur_archer",
      rate: 0.660344,
    },
    {
      combatMonsterHrid: "/monsters/luna_empress",
      rate: 0.1,
    },
  ],
  "/actions/combat/gobo_planet": [
    {
      combatMonsterHrid: "/monsters/gobo_stabby",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/monsters/gobo_slashy",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/monsters/gobo_smashy",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/monsters/gobo_shooty",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/monsters/gobo_boomy",
      rate: 0.4,
    },
    {
      combatMonsterHrid: "/monsters/gobo_chieftain",
      rate: 0.1,
    },
  ],
  "/actions/combat/bear_with_it": [
    {
      combatMonsterHrid: "/monsters/gummy_bear",
      rate: 0.587196,
    },
    {
      combatMonsterHrid: "/monsters/panda",
      rate: 0.479028,
    },
    {
      combatMonsterHrid: "/monsters/black_bear",
      rate: 0.514348,
    },
    {
      combatMonsterHrid: "/monsters/grizzly_bear",
      rate: 0.485651,
    },
    {
      combatMonsterHrid: "/monsters/polar_bear",
      rate: 0.450331,
    },
    {
      combatMonsterHrid: "/monsters/red_panda",
      rate: 0.1,
    },
  ],
  "/actions/combat/golem_cave": [
    {
      combatMonsterHrid: "/monsters/magnetic_golem",
      rate: 0.88421,
    },
    {
      combatMonsterHrid: "/monsters/stalactite_golem",
      rate: 0.778947,
    },
    {
      combatMonsterHrid: "/monsters/granite_golem",
      rate: 0.705263,
    },
    {
      combatMonsterHrid: "/monsters/crystal_colossus",
      rate: 0.1,
    },
  ],
  "/actions/combat/sorcerers_tower": [
    {
      combatMonsterHrid: "/monsters/novice_sorcerer",
      rate: 0.96124,
    },
    {
      combatMonsterHrid: "/monsters/ice_sorcerer",
      rate: 0.89664,
    },
    {
      combatMonsterHrid: "/monsters/flame_sorcerer",
      rate: 0.899224,
    },
    {
      combatMonsterHrid: "/monsters/elementalist",
      rate: 0.749354,
    },
    {
      combatMonsterHrid: "/monsters/chronofrost_sorcerer",
      rate: 0.1,
    },
  ],
  "/actions/combat/planet_of_the_eyes": [
    {
      combatMonsterHrid: "/monsters/eye",
      rate: 0.888691,
    },
    {
      combatMonsterHrid: "/monsters/eyes",
      rate: 0.778235,
    },
    {
      combatMonsterHrid: "/monsters/veyes",
      rate: 0.703626,
    },
    {
      combatMonsterHrid: "/monsters/the_watcher",
      rate: 0.1,
    },
  ],
  "/actions/combat/twilight_zone": [
    {
      combatMonsterHrid: "/monsters/zombie",
      rate: 0.875862,
    },
    {
      combatMonsterHrid: "/monsters/vampire",
      rate: 0.786206,
    },
    {
      combatMonsterHrid: "/monsters/werewolf",
      rate: 0.703448,
    },
    {
      combatMonsterHrid: "/monsters/dusk_revenant",
      rate: 0.1,
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
  const [fromRaw, setFromRaw] = useState(false);
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
  console.log(fromRaw);
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
        <td>
          {getFriendlyIntString(
            fromRaw ? x.dropsPerHour * 24 : x.dropsPerHour,
            2
          )}
        </td>
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
        <td>
          {getFriendlyIntString(fromRaw ? x.coinPerHour * 24 : x.coinPerHour)}
        </td>
        <td>
          {i === lootData.length - 1 && (
            <Switch
              onLabel="DAY"
              offLabel="HOUR"
              label="Per hour or day"
              size="xl"
              checked={fromRaw}
              onChange={(event) => setFromRaw(event.currentTarget.checked)}
            />
          )}
        </td>
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
                <th>{fromRaw ? "Rate/day" : "Rate/hr"}</th>
                <th>Price/item</th>
                <th>{fromRaw ? "Coin/day" : "Coin/hr"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lootRows}
              <tr>
                <th colSpan={3}>Total</th>
                <td>
                  {getFriendlyIntString(
                    fromRaw ? totalCoinsPerHour * 24 : totalCoinsPerHour
                  )}
                </td>
                <td></td>
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
