import {
  Flex,
  Group,
  MultiSelect,
  NativeSelect,
  NumberInput,
  Switch,
  Text,
} from "@mantine/core";
import Materials from "./Materials";
import { ApiData } from "../services/ApiService";
import { useContext, useEffect, useMemo, useState } from "react";
import { Skill, getTeaBonuses } from "../helpers/CommonFunctions";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  skill: Skill;
  data: ApiData;
}

export default function ActionCategorySelector({ skill, data }: Props) {
  const { userInfo } = useContext(userInfoContext);
  const [fromRaw, setFromRaw] = useState(
    userInfo.current.ActionCategorySelector[skill].fromRaw
  );
  const [level, setLevel] = useState(
    userInfo.current.ActionCategorySelector[skill].level
  );
  const [xp, setXp] = useState(
    userInfo.current.ActionCategorySelector[skill].xp
  );
  const [targetLevel, setTargetLevel] = useState(
    userInfo.current.ActionCategorySelector[skill].targetLevel
  );
  const [toolBonus, setToolBonus] = useState(
    userInfo.current.ActionCategorySelector[skill].toolBonus
  );
  const [teas, setTeas] = useState(
    userInfo.current.ActionCategorySelector[skill].teas
  );
  const [gearEfficiency, setGearEfficiency] = useState(
    userInfo.current.ActionCategorySelector[skill].gearEfficiency
  );
  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);

  const availableTeas = Object.values(data.itemDetails)
    .filter(
      (x) =>
        x.consumableDetail.usableInActionTypeMap?.[`/action_types/${skill}`]
    )
    .map((x) => ({
      label: x.name,
      value: x.hrid,
    }));

  const options = useMemo(
    () =>
      userInfo.current.ActionCategorySelector[skill].options.length > 0
        ? userInfo.current.ActionCategorySelector[skill].options
        : Object.values(data.actionCategoryDetails)
            .filter((x) => x.hrid.startsWith(`/action_categories/${skill}`))
            .sort((a, b) => {
              if (a.sortIndex < b.sortIndex) return -1;
              if (a.sortIndex > b.sortIndex) return 1;
              return 0;
            })
            .map((x) => ({
              value: x.hrid,
              label: x.name,
            })),
    [skill, data.actionCategoryDetails]
  );

  useEffect(() => {
    userInfo.current = {
      ...userInfo.current,
      ActionCategorySelector: {
        ...userInfo.current.ActionCategorySelector,
        [skill]: {
          fromRaw,
          level,
          xp,
          targetLevel,
          toolBonus,
          teas,
          gearEfficiency,
          options,
        },
      },
    };
  }, [
    userInfo.current.tabControl.current === "cheesesmithing",
    userInfo.current.tabControl.current === "crafting",
    userInfo.current.tabControl.current === "tailoring",
    userInfo.current.tabControl.current === "cooking",
    userInfo.current.tabControl.current === "brewing",
  ]);

  const [category, setCategory] = useState(options[0].value);

  const effectiveLevel = (level || 1) + levelTeaBonus;

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Group>
        <NativeSelect
          label="Category"
          withAsterisk
          data={options}
          value={category}
          onChange={(event) => setCategory(event.currentTarget.value)}
        />
        <Switch
          onLabel="CRAFT UPGRADE ITEM"
          offLabel="BUY UPGRADE ITEM"
          size="xl"
          checked={fromRaw}
          onChange={(event) => setFromRaw(event.currentTarget.checked)}
        />
        <NumberInput
          value={level}
          onChange={setLevel}
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
        <NumberInput
          value={xp}
          onChange={setXp}
          label="Experience"
          withAsterisk
          hideControls
        />
        <NumberInput
          value={targetLevel}
          onChange={setTargetLevel}
          label="Target Level"
          withAsterisk
          hideControls
        />
      </Group>
      {category && (
        <Materials
          actionCategory={category}
          data={data}
          effectiveLevel={effectiveLevel}
          xp={xp}
          targetLevel={targetLevel}
          toolBonus={toolBonus}
          gearEfficiency={gearEfficiency}
          fromRaw={fromRaw}
          teas={teas}
          skill={skill}
        />
      )}
    </Flex>
  );
}
