import { useContext, useEffect } from "react";
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

  const {
    item,
    level,
    toolBonus,
    gearSpeed,
    teas,
    target,
    availableTeas,
    items,
    itemOptions,
  } = userInfo.current.Enhancing;
  const skill = Skill.Enhancing;

  useEffect(() => {
    userInfo.current.changeEnhancing((curr) => ({
      ...curr,
      availableTeas: Object.values(data.itemDetails)
        .filter(
          (x) =>
            x.consumableDetail.usableInActionTypeMap?.[ActionType.Enhancing]
        )
        .map((x) => ({
          label: x.name,
          value: x.hrid,
        })),
      items: Object.values(data.itemDetails)
        .filter((x) => x.enhancementCosts)
        .sort((a, b) => {
          if (a.sortIndex < b.sortIndex) return -1;
          if (a.sortIndex > b.sortIndex) return 1;
          return 0;
        }),
    }));
  }, [data.itemDetails]);

  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);

  useEffect(() => {
    userInfo.current.changeEnhancing((curr) => ({
      ...curr,
      itemOptions: items.map((x) => ({
        value: x.hrid,
        label: x.name,
      })),
    }));
  }, [items]);

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
          onChange={(val) =>
            userInfo.current.changeEnhancing((curr) => ({
              ...curr,
              level: val,
            })).r
          }
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
          onChange={(val) =>
            userInfo.current.changeEnhancing((curr) => ({
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
          value={gearSpeed}
          onChange={(val) =>
            userInfo.current.changeEnhancing((curr) => ({
              ...curr,
              gearSpeed: val,
            })).r
          }
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
            onChange={(val) =>
              userInfo.current.changeEnhancing((curr) => ({
                ...curr,
                teas: val,
              })).r
            }
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
          onChange={(val) =>
            userInfo.current.changeEnhancing((curr) => ({ ...curr, item: val }))
              .r
          }
          data={itemOptions}
          label="Select an item"
          placeholder="Pick one"
        />
        <NumberInput
          value={target}
          onChange={(value) =>
            userInfo.current.changeEnhancing((curr) => ({
              ...curr,
              target: value || 1,
            })).r
          }
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
