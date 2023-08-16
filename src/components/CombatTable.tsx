import { useEffect, useState } from "react";
import { getFriendlyIntString } from "../helpers/Formatting";
import { ItemDetail } from "../models/Client";
import { MarketValue } from "../models/Market";
import { ApiData } from "../services/ApiService";
import { Flex, NumberInput, Switch, Table } from "@mantine/core";
import Icon from "./Icon";

type Enemies = {
  combatMonsterHrid: string;
  rate: number;
}[];

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

  const getRandomEncounter = () => {
    const totalWeight = data.actionDetails[
      action
    ].monsterSpawnInfo.spawns!.reduce((prev, cur) => prev + cur.rate, 0);

    const encounterHrids = [];
    let totalStrength = 0;

    outer: for (
      let i = 0;
      i < data.actionDetails[action].monsterSpawnInfo.maxSpawnCount;
      i++
    ) {
      const randomWeight = totalWeight * Math.random();
      let cumulativeWeight = 0;

      for (const spawn of data.actionDetails[action].monsterSpawnInfo.spawns!) {
        cumulativeWeight += spawn.rate;
        if (randomWeight <= cumulativeWeight) {
          totalStrength += spawn.strength;

          if (
            totalStrength <=
            data.actionDetails[action].monsterSpawnInfo.maxTotalStrength
          ) {
            encounterHrids.push(spawn.combatMonsterHrid);
          } else {
            break outer;
          }
          break;
        }
      }
    }
    return encounterHrids;
  };
  const getMultipleEncounters = (
    kph: number
  ): ((() => undefined) | string[])[] => {
    const encounterList = [];
    for (let i = 1; i < kph + 1; i++) {
      if (i % 10 === 0 && i !== 0) {
        encounterList.push(
          data.actionDetails[action].monsterSpawnInfo.bossFightMonsters
        );
      } else encounterList.push(getRandomEncounter());
    }
    return encounterList;
  };
  const getTotalKillsPerMonster = (encounterList: any) => {
    const count = encounterList.flat().reduce((acc: any, value: any) => {
      acc[value] = ++acc[value] || 1;

      return acc;
    }, {});
    return count;
  };
  const getEncounterRate = (
    totalKillsPerMonster: { [name: string]: number },
    kph: number
  ) => {
    const planetSpawnRate = [{}];
    planetSpawnRate.pop();
    data.actionDetails[action].monsterSpawnInfo
      .spawns!.concat(
        data.actionDetails[action].monsterSpawnInfo.bossFightMonsters
      )
      .map((x) => {
        const monster = data.combatMonsterDetails[x.combatMonsterHrid ?? x];
        const keys = Object.keys(totalKillsPerMonster);
        keys.forEach((key) => {
          if (monster.hrid === key) {
            planetSpawnRate.push({
              combatMonsterHrid: monster.hrid,
              rate: totalKillsPerMonster[key] / kph,
            });
          }
        });
      });
    return planetSpawnRate;
  };
  const [enemies, setEnemies] = useState<Enemies>(
    getEncounterRate(
      getTotalKillsPerMonster(getMultipleEncounters(kph)),
      kph
    ) as Enemies
  ); // so it doesn't get new rates everytime you change day/hr
  useEffect(() => {
    setEnemies(
      getEncounterRate(
        getTotalKillsPerMonster(getMultipleEncounters(kph)),
        kph
      ) as Enemies
    );
  }, [kph]); // only change when there's kph change

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
        <td>{getFriendlyIntString(x.rate, 2)}</td>
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
        <td></td>
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
                <td>
                  {" "}
                  <Switch
                    onLabel="DAY"
                    offLabel="HOUR"
                    label="Per hour or day"
                    size="xl"
                    checked={fromRaw}
                    onChange={(event) =>
                      setFromRaw(event.currentTarget.checked)
                    }
                  />
                </td>
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
