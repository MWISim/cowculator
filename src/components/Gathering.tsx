import {
  Flex,
  MultiSelect,
  NumberInput,
  Space,
  Table,
  Text,
} from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { ActionType, DropTable } from "../models/Client";
import { useContext, useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { getFriendlyIntString } from "../helpers/Formatting";
import {
  Skill,
  getActionSeconds,
  getTeaBonuses,
} from "../helpers/CommonFunctions";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  type: ActionType;
  data: ApiData;
  skill: Skill;
}

export default function Gathering({ type, data, skill }: Props) {
  const { userInfo } = useContext(userInfoContext);
  const [level, setLevel] = useState(userInfo.current.Gathering[skill].level);
  const [toolBonus, setToolBonus] = useState(
    userInfo.current.Gathering[skill].toolBonus
  );
  const [gearEfficiency, setGearEfficiency] = useState(
    userInfo.current.Gathering[skill].gearEfficiency
  );
  const [teas, setTeas] = useState(userInfo.current.Gathering[skill].teas);
  const [priceOverrides, setPriceOverrides] = useState(
    userInfo.current.Gathering[skill].priceOverrides
  );

  const {
    levelTeaBonus,
    wisdomTeaBonus,
    gatheringTeaBonus,
    efficiencyTeaBonus,
    teaError,
  } = getTeaBonuses(teas, skill);

  const effectiveLevel = level + levelTeaBonus;

  const availableTeas = Object.values(data.itemDetails)
    .filter((x) => x.consumableDetail.usableInActionTypeMap?.[type])
    .map((x) => ({
      label: x.name,
      value: x.hrid,
    }));

  const actions = Object.values(data.actionDetails)
    .filter((x) => x.type === type)
    .sort((a, b) => {
      if (a.sortIndex > b.sortIndex) return -1;
      if (a.sortIndex < b.sortIndex) return 1;
      return 0;
    });

  const getItemsPerAction = (items: DropTable[] | null) => {
    return (
      items?.map((y) => {
        const averageDrop = (y.minCount + y.maxCount) / 2;

        return {
          itemHrid: y.itemHrid,
          avgCount: y.dropRate * averageDrop * gatheringTeaBonus,
        };
      }) ?? []
    );
  };

  const getRareItemsPerAction = (items: DropTable[] | null) => {
    return (
      items?.map((y) => {
        const averageDrop = (y.minCount + y.maxCount) / 2;

        return {
          itemHrid: y.itemHrid,
          avgCount: y.dropRate * averageDrop,
        };
      }) ?? []
    );
  };

  const getApproxValue = (hrid: string): number => {
    if (hrid === "/items/coin") return 1;

    if (priceOverrides[hrid]) return +priceOverrides[hrid];

    const item = data.itemDetails[hrid];

    if (item.ask === -1 && item.bid === -1) {
      return item.sellPrice;
    } else if (item.ask === -1) {
      return item.bid;
    } else if (item.bid === -1) {
      return item.ask;
    } else {
      return +((item.ask + item.bid) / 2).toFixed(0);
    }
  };

  const getAveragePrice = (items: DropTable[] | null): number => {
    let price = 0;

    if (!items) return price;

    price = items
      .map((y) => {
        const averageCost = getApproxValue(y.itemHrid);
        const averageDrop = (y.minCount + y.maxCount) / 2;

        return y.dropRate * averageDrop * gatheringTeaBonus * averageCost;
      })
      .reduce((acc, val) => acc + val);

    return price;
  };

  const relevantItems = useMemo(
    () =>
      userInfo.current.Gathering[skill].relevantItems.length > 0
        ? userInfo.current.Gathering[skill].relevantItems
        : [
            ...new Set(
              actions
                .flatMap((x) => {
                  return x.dropTable ?? [];
                })
                .map((x) => data.itemDetails[x.itemHrid])
            ),
          ],
    [actions, data.itemDetails]
  );

  useEffect(() => {
    userInfo.current = {
      ...userInfo.current,
      Gathering: {
        ...userInfo.current.Gathering,
        [skill]: {
          level,
          toolBonus,
          gearEfficiency,
          teas,
          priceOverrides,
          relevantItems,
        },
      },
    };
  }, [
    userInfo.current.tabControl.current === "milking",
    userInfo.current.tabControl.current === "foraging",
    userInfo.current.tabControl.current === "woodcutting",
  ]);

  const marketRows = relevantItems.map((x) => {
    return (
      <tr key={type + "/override/" + x.hrid}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.hrid} /> {x.name}
          </Flex>
        </td>
        <td>{x.ask}</td>
        <td>{x.bid}</td>
        <td>{x.sellPrice}</td>
        <td>
          <NumberInput
            hideControls
            value={priceOverrides[x.hrid]}
            placeholder={`${getApproxValue(x.hrid)}`}
            onChange={(y) =>
              setPriceOverrides({
                ...priceOverrides,
                [x.hrid]: y,
              })
            }
          />
        </td>
      </tr>
    );
  });

  const rows = actions.map((x) => {
    const seconds = getActionSeconds(x.baseTimeCost, toolBonus);
    const exp = x.experienceGain.value * wisdomTeaBonus;
    const levelReq = x.levelRequirement.level;
    const efficiency =
      Math.max(1, (100 + (effectiveLevel || 1) - levelReq) / 100) +
      efficiencyTeaBonus +
      (gearEfficiency || 0) / 100;

    const lootPerAction = getItemsPerAction(x.dropTable).concat(
      getRareItemsPerAction(x.rareDropTable)
    );

    const itemResults = lootPerAction.map((y) => (
      <Flex
        key={`${type}/itemResult/${y.itemHrid}`}
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        gap="xs"
      >
        <Icon hrid={y.itemHrid} />
        {getFriendlyIntString((y.avgCount / seconds) * 3600 * efficiency, 2)}
      </Flex>
    ));

    const expPerHour = ((exp / seconds) * 3600 * efficiency).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 0,
      }
    );

    const profit = getAveragePrice(x.dropTable) * 0.98;

    const profitPerHour = (
      (profit / seconds) *
      3600 *
      efficiency
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
      <tr key={type + "/" + x.hrid}>
        <td>{levelReq}</td>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.hrid} /> {x.name}
          </Flex>
        </td>
        <td>{exp.toFixed(2)}</td>
        <td>{seconds.toFixed(2)}s</td>
        <td>{efficiency.toFixed(2)}</td>
        <td>{expPerHour}</td>
        <td>{itemResults}</td>
        <td>{getFriendlyIntString(profit)}</td>
        <td>{profitPerHour}</td>
      </tr>
    );
  });

  return (
    <>
      <Flex
        gap="sm"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        direction="row"
      >
        <NumberInput
          value={level}
          onChange={(val) => setLevel(val || 1)}
          label="Level"
          withAsterisk
          hideControls
          rightSection={
            levelTeaBonus && (
              <>
                <Text c="#EE9A1D">+{levelTeaBonus}</Text>
              </>
            )
          }
        />
        <NumberInput
          value={toolBonus}
          onChange={setToolBonus}
          label="Tool Bonus"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <NumberInput
          value={gearEfficiency}
          onChange={setGearEfficiency}
          label="Gear Efficiency"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <MultiSelect
          data={availableTeas}
          value={teas}
          onChange={setTeas}
          label="Teas"
          maxSelectedValues={3}
          error={teaError}
          clearable
        />
      </Flex>
      <Space h="md" />
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
                <th>Item</th>
                <th>Median Ask</th>
                <th>Median Bid</th>
                <th>Vendor</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>{marketRows}</tbody>
          </Table>
        </Flex>
        <Flex>
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Level</th>
                <th>Action</th>
                <th>XP</th>
                <th>Time</th>
                <th>Efficiency</th>
                <th>XP/h</th>
                <th>Items/h</th>
                <th>Profit</th>
                <th>Profit/h</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Flex>
      </Flex>
    </>
  );
}
