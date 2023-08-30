import { useContext, useEffect, useMemo, useState } from "react";
import {
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Tooltip,
  Text,
} from "@mantine/core";
import { ApiData } from "../services/ApiService";
import EnhancingCalc from "./EnhancingCalc";
import { ActionType } from "../models/Client";
import { Skill, getTeaBonuses } from "../helpers/CommonFunctions";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  data: ApiData;
}

export default function Enhancing({ data }: Props) {
  const { userInfo } = useContext(userInfoContext);
  const skill = Skill.Enhancing;
  const [item, setItem] = useState(userInfo.current.Enhancing.item);
  const [level, setLevel] = useState(userInfo.current.Enhancing.level);
  const [toolBonus, setToolBonus] = useState(
    userInfo.current.Enhancing.toolBonus
  );
  const [gearSpeed, setGearSpeed] = useState(
    userInfo.current.Enhancing.gearSpeed
  );
  const [teas, setTeas] = useState(userInfo.current.Enhancing.teas);
  const [target, setTarget] = useState(userInfo.current.Enhancing.target);

  const availableTeas = useMemo(
    () =>
      userInfo.current.Enhancing.availableTeas.length > 0
        ? userInfo.current.Enhancing.availableTeas
        : Object.values(data.itemDetails)
            .filter(
              (x) =>
                x.consumableDetail.usableInActionTypeMap?.[ActionType.Enhancing]
            )
            .map((x) => ({
              label: x.name,
              value: x.hrid,
            })),
    [data.itemDetails]
  );

  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);

  const items = useMemo(
    () =>
      userInfo.current.Enhancing.items.length > 0
        ? userInfo.current.Enhancing.items
        : Object.values(data.itemDetails)
            .filter((x) => x.enhancementCosts)
            .sort((a, b) => {
              if (a.sortIndex < b.sortIndex) return -1;
              if (a.sortIndex > b.sortIndex) return 1;
              return 0;
            }),
    [data.itemDetails]
  );

  const itemOptions = useMemo(
    () =>
      userInfo.current.Enhancing.itemOptions.length > 0
        ? userInfo.current.Enhancing.itemOptions
        : items.map((x) => ({
            value: x.hrid,
            label: x.name,
          })),
    [items]
  );

  useEffect(() => {
    userInfo.current = {
      ...userInfo.current,
      Enhancing: {
        item,
        level,
        toolBonus,
        gearSpeed,
        teas,
        target,
        availableTeas,
        items,
        itemOptions,
      },
    };
  }, [userInfo.current.tabControl.current === "enhancing"]);

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Group>
        <NumberInput
          value={level}
          onChange={setLevel}
          label="Enhancing Level"
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
          value={gearSpeed}
          onChange={setGearSpeed}
          label="Gear Speed"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <Tooltip
          label="Tea costs are not yet included in cost calculations."
          withArrow
        >
          <MultiSelect
            clearable
            data={availableTeas}
            value={teas}
            onChange={setTeas}
            label="Teas"
            maxSelectedValues={3}
            error={teaError}
          />
        </Tooltip>
      </Group>
      <Group>
        <Select
          searchable
          size="lg"
          value={item}
          onChange={setItem}
          data={itemOptions}
          label="Select an item"
          placeholder="Pick one"
        />
        <NumberInput
          value={target}
          onChange={(value) => setTarget(value || 1)}
          label="Target Level"
          withAsterisk
          min={1}
          max={20}
        />
      </Group>
      {item && (
        <EnhancingCalc
          data={data}
          item={data.itemDetails[item]}
          baseLevel={level || 1}
          toolPercent={toolBonus || 0}
          gearSpeed={gearSpeed || 0}
          target={target}
          teas={teas}
        />
      )}
    </Flex>
  );
}
