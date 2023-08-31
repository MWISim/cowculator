import { Flex, Select, Grid, Table, Title } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { useContext, useEffect } from "react";
import Icon from "./Icon";
import { userInfoContext } from "../helpers/StoredUserData";

interface Props {
  data: ApiData;
}

export default function ItemLookup({ data }: Props) {
  const { userInfo } = useContext(userInfoContext);

  const { item, items } = userInfo.current.ItemLookup;

  useEffect(() => {
    userInfo.current.changeItemLookup((curr) => ({
      ...curr,
      items: Object.values(data.itemDetails).map((x) => ({
        value: x.hrid,
        label: x.name,
      })),
    }));
  }, [data.itemDetails]);

  const choice = data.itemDetails[item || ""] || {};

  const inputs = Object.values(data.actionDetails).filter((x) =>
    x.inputItems?.some((y) => y.itemHrid === choice.hrid)
  );
  const outputs = Object.values(data.actionDetails).filter((x) =>
    x.outputItems?.some((y) => y.itemHrid === choice.hrid)
  );
  const drops = Object.values(data.actionDetails).filter((x) =>
    x.dropTable?.some((y) => y.itemHrid === choice.hrid)
  );
  const rareDrops = Object.values(data.actionDetails).filter((x) =>
    x.rareDropTable?.some((y) => y.itemHrid === choice.hrid)
  );
  const monsterDrops = Object.values(data.combatMonsterDetails).filter((x) =>
    x.dropTable?.some((y) => y.itemHrid === choice.hrid)
  );
  const monsterRareDrops = Object.values(data.combatMonsterDetails).filter(
    (x) => x.rareDropTable?.some((y) => y.itemHrid === choice.hrid)
  );
  const enhancingCosts = Object.values(data.itemDetails).filter((x) =>
    x.enhancementCosts?.some((y) => y.itemHrid === choice.hrid)
  );

  const getCountString = (min?: number, max?: number): string => {
    return min === max ? `${min}` : `${min} - ${max}`;
  };

  return (
    <Flex direction="column" gap="sm">
      <Select
        clearable
        searchable
        size="lg"
        value={item}
        onChange={(val) =>
          userInfo.current.changeItemLookup((curr) => ({ ...curr, item: val }))
            .r
        }
        data={items}
        label="Select an item"
      />
      <Grid>
        {inputs.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Inputs</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Count</th>
                  <th>Item</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map((x) => {
                  const outputItem = x.outputItems?.[0];
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <td>
                        {x.inputItems?.find((y) => y.itemHrid === item)?.count}
                      </td>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        {outputItem && <Icon hrid={outputItem?.itemHrid} />}
                        {x.name}
                      </Flex>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {outputs.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Outputs</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {outputs.map((x) => {
                  const outputItem = x.outputItems?.find(
                    (y) => y.itemHrid === item
                  );
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        {outputItem && <Icon hrid={outputItem.itemHrid} />}{" "}
                        {x.name}
                      </Flex>
                      <td>{outputItem?.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {drops.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Drops</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rate</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {drops.map((x) => {
                  const i = x.dropTable?.find((y) => y.itemHrid === item);
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        <Icon hrid={x.hrid} /> {x.name}
                      </Flex>
                      <td>
                        {i?.dropRate.toLocaleString(undefined, {
                          style: "percent",
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>{getCountString(i?.minCount, i?.maxCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {rareDrops.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Rare Drops</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rate</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {rareDrops.map((x) => {
                  const i = x.rareDropTable?.find((y) => y.itemHrid === item);
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        <Icon hrid={x.hrid} /> {x.name}
                      </Flex>
                      <td>
                        {i?.dropRate.toLocaleString(undefined, {
                          style: "percent",
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>{getCountString(i?.minCount, i?.maxCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {monsterDrops.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Monster Drops</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rate</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {monsterDrops.map((x) => {
                  const i = x.dropTable?.find((y) => y.itemHrid === item);
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        <Icon hrid={x.hrid} /> {x.name}
                      </Flex>
                      <td>
                        {i?.dropRate.toLocaleString(undefined, {
                          style: "percent",
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>{getCountString(i?.minCount, i?.maxCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {monsterRareDrops.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Monster Rare Drops</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Rate</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {monsterRareDrops.map((x) => {
                  const i = x.rareDropTable?.find((y) => y.itemHrid === item);
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        <Icon hrid={x.hrid} /> {x.name}
                      </Flex>
                      <td>
                        {i?.dropRate.toLocaleString(undefined, {
                          style: "percent",
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>{getCountString(i?.minCount, i?.maxCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
        {enhancingCosts.length > 0 && (
          <Grid.Col span={6}>
            <Title align="center">Enhancing Costs</Title>
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {enhancingCosts.map((x) => {
                  const i = x.enhancementCosts?.find(
                    (y) => y.itemHrid === item
                  );
                  return (
                    <tr key={"item-search-input" + x.hrid}>
                      <Flex
                        justify="flex-start"
                        align="center"
                        direction="row"
                        wrap="wrap"
                        gap="xs"
                      >
                        <Icon hrid={x.hrid} /> {x.name}
                      </Flex>
                      <td>{i?.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Grid.Col>
        )}
      </Grid>
    </Flex>
  );
}
