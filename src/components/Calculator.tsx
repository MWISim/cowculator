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

  const { action, fromRaw } = userInfo.current.Calculator;

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
        onChange={(val) =>
          userInfo.current.changeCalculator((curr) => ({
            ...curr,
            action: val,
          })).r
        }
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
        onChange={(event) =>
          userInfo.current.changeCalculator((curr) => ({
            ...curr,
            fromRaw: event.currentTarget.checked,
          })).r
        }
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
