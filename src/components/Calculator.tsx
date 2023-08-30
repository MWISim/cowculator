import { useState, useContext, useEffect } from "react";
import { Flex, Select, Switch } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import ActionCalc from "./ActionCalc";
import { ActionFunction } from "../models/Client";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  data: ApiData;
}

export default function Calculator({ data }: Props) {
  const { userInfo } = useContext(userInfoContext);
  const [action, setAction] = useState(userInfo.current.Calculator.action);
  const [fromRaw, setFromRaw] = useState(userInfo.current.Calculator.fromRaw);

  useEffect(() => {
    userInfo.current = {
      ...userInfo.current,
      Calculator: { action, fromRaw },
    };
  }, [userInfo.current.tabControl.current === "production"]);

  const actions = Object.values(data.actionDetails)
    .filter((x) => x.function === ActionFunction.Production)
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
        size="lg"
        value={action}
        onChange={setAction}
        data={actions}
        label="Select an item"
        placeholder="Pick one"
      />
      <Switch
        onLabel="CRAFT"
        offLabel="BUY"
        label="Upgrade Items"
        size="xl"
        checked={fromRaw}
        onChange={(event) => setFromRaw(event.currentTarget.checked)}
      />
      {action && (
        <ActionCalc
          fromRaw={fromRaw}
          action={data.actionDetails[action]}
          data={data}
        />
      )}
    </Flex>
  );
}
