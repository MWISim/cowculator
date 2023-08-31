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
import { getTeaBonuses } from "../helpers/CommonFunctions";
import { UserDetails, userInfoContext } from "../helpers/StoredUserData";

interface Props {
  skill: keyof UserDetails["ActionCategorySelector"];
  data: ApiData;
}

export default function ActionCategorySelector({ skill, data }: Props) {
  const { userInfo } = useContext(userInfoContext);

  const { fromRaw, level, xp, targetLevel, toolBonus, teas, gearEfficiency } =
    userInfo.current.ActionCategorySelector[skill];
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
        <Switch
          onLabel="CRAFT UPGRADE ITEM"
          offLabel="BUY UPGRADE ITEM"
          size="xl"
          checked={fromRaw}
          onChange={(event) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              fromRaw: event.currentTarget.checked,
            })).r
          }
        />
        <NumberInput
          value={level}
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              level: val,
            })).r
          }
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
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              toolBonus: val,
            })).r
          }
          label="Tool Bonus"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <NumberInput
          value={gearEfficiency}
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              gearEfficiency: val,
            })).r
          }
          label="Gear Efficiency"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <MultiSelect
          data={availableTeas}
          value={teas}
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              teas: val,
            })).r
          }
          label="Teas"
          maxSelectedValues={3}
          error={teaError}
          clearable
        />
        <NumberInput
          value={xp}
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              xp: val,
            })).r
          }
          label="Experience"
          withAsterisk
          hideControls
        />
        <NumberInput
          value={targetLevel}
          onChange={(val) =>
            userInfo.current.changeActionCategorySelector(skill, (curr) => ({
              ...curr,
              targetLevel: val,
            })).r
          }
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
