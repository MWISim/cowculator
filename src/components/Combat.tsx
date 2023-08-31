import { Flex, NumberInput, Select } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { ActionFunction } from "../models/Client";
import { useContext } from "react";
import CombatTable from "./CombatTable";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  data: ApiData;
}

export default function Combat({ data }: Props) {
  const { userInfo } = useContext(userInfoContext);

  const { action, kph } = userInfo.current.Combat;

  const actions = Object.values(data.actionDetails)
    .filter((x) => x.function === ActionFunction.Combat)
    .sort((a, b) => {
      if (a.sortIndex < b.sortIndex) return -1;
      if (a.sortIndex > b.sortIndex) return 1;
      return 0;
    })
    .map((x) => ({
      value: x.hrid,
      label: x.name,
    }));

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Select
        searchable
        clearable
        withAsterisk
        size="lg"
        value={action}
        onChange={(val) =>
          userInfo.current.changeCombat((curr) => ({ ...curr, action: val })).r
        }
        data={actions}
        label="Select a zone"
        placeholder="Pick one"
      />
      <NumberInput
        value={kph}
        onChange={(val) =>
          userInfo.current.changeCombat((curr) => ({ ...curr, kph: val || 0 }))
            .r
        }
        label="Encounters/hr"
        withAsterisk
        hideControls
        min={0}
        precision={2}
      />
      {action && kph > 0 && (
        <CombatTable action={action} data={data} kph={kph} />
      )}
    </Flex>
  );
}
