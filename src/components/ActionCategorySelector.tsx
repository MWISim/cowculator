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
import { useMemo, useState } from "react";
import {Skill, getTeaBonuses, getAvailableTeas} from "../helpers/CommonFunctions";

interface Props {
  skill: Skill;
  data: ApiData;
  showFromRaw?: boolean;
}

export default function ActionCategorySelector({ skill, data , showFromRaw = true}: Props) {
  const [fromRaw, setFromRaw] = useState(false);
  const [level, setLevel] = useState<number | "">(1);
  const [xp, setXp] = useState<number | "">("");
  const [targetLevel, setTargetLevel] = useState<number | "">("");
  const [toolBonus, setToolBonus] = useState<number | "">(0);
  const [teas, setTeas] = useState([""]);
  const [gearEfficiency, setGearEfficiency] = useState<number | "">(0)
  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);

  const availableTeas = getAvailableTeas(data, `/action_types/${skill}`);

  const options = useMemo(
    () =>
      Object.values(data.actionCategoryDetails)
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
        {showFromRaw && (<Switch
          onLabel="CRAFT UPGRADE ITEM"
          offLabel="BUY UPGRADE ITEM"
          size="xl"
          checked={fromRaw}
          onChange={(event) => setFromRaw(event.currentTarget.checked)}
        />)}
        <NumberInput
          value={level}
          onChange={setLevel}
          label="Level"
          withAsterisk
          hideControls
          className="small"
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
          className="medium"
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <NumberInput
          value={gearEfficiency}
          onChange={setGearEfficiency}
          label="Gear Efficiency"
          withAsterisk
          hideControls
          className="medium"
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
          className="medium"
          withAsterisk
          hideControls
        />
        <NumberInput
          value={targetLevel}
          onChange={setTargetLevel}
          label="Target Level"
          withAsterisk
          hideControls
          className="medium"
          min={level}
          max={200}
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
