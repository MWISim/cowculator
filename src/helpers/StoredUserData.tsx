import { createContext, useRef } from "react";
import {
  ActionCategoryDetailMap,
  ActionDetailMap,
  ItemDetail,
} from "../models/Client";
import { MarketValue } from "../models/Market";
import { Skill } from "./CommonFunctions";
import { TabsValue } from "@mantine/core";

type UserT = {
  tabControl: {
    current: TabsValue;
  };
  Character: {
    character: {
      [key: string]: {
        level: number;
        toolHrid: string | null;
        toolLevel: number;
      };
    };
    relevantSkills: ActionCategoryDetailMap[];
    toolMap: Map<string, (ItemDetail & MarketValue)[]>;
  };
  Calculator: {
    action: string | null;
    fromRaw: boolean;
  };
  ActionCalc: {
    priceOverrides: { [key: string]: number | "" };
    teas: string[];
  };
  ItemLookup: {
    item: string | null;
    items: { value: string; label: string }[];
  };
  Gathering: {
    [key in Skill]: {
      level: number;
      toolBonus: number | "";
      gearEfficiency: number | "";
      teas: string[];
      priceOverrides: { [key: string]: number | "" };
      relevantItems: (ItemDetail & MarketValue)[];
    };
  };
  ActionCategorySelector: {
    [key in Skill]: {
      fromRaw: boolean;
      level: number | "";
      xp: number | "";
      targetLevel: number | "";
      toolBonus: number | "";
      teas: string[];
      gearEfficiency: number | "";
      options: { value: string; label: string }[];
      // category: string;
    };
  };
  Materials: {
    priceOverrides: { [key: string]: number | "" };
    actions: ActionDetailMap[];
    relevantItems: (ItemDetail & MarketValue)[];
  };
  Enhancing: {
    item: string | null;
    level: number | "";
    toolBonus: number | "";
    gearSpeed: number | "";
    teas: string[];
    target: number;
    availableTeas: { value: string; label: string }[];
    items: (ItemDetail & MarketValue)[];
    itemOptions: { value: string; label: string }[];
  };
  EnhancingCalc: {
    protCostOverride: number | "";
    priceOverrides: { [key: string]: number | "" };
  };
  Combat: {
    action: string | null;
    kph: number;
  };
  CombatTable: {
    priceOverrides: { [key: string]: number | "" };
  };
  Market: {
    search: string;
  };
};

type contextT = {
  userInfo: React.MutableRefObject<UserT>;
};

export const userInfoContext = createContext<contextT>({} as contextT);

export const UserInfoProvider = ({ children }) => {
  const gather = {
    level: 1,
    toolBonus: 0,
    gearEfficiency: 0,
    teas: [""],
    priceOverrides: {},
    relevantItems: [],
  };
  const actionCat = {
    fromRaw: false,
    level: 1,
    xp: "",
    targetLevel: "",
    toolBonus: 0,
    teas: [""],
    gearEfficiency: 0,
    options: [],
  };
  const userInfo = useRef<UserT>({
    tabControl: {
      current: "production",
    },
    Character: {
      character: {},
      relevantSkills: [],
      toolMap: new Map(),
    },
    Calculator: {
      action: null,
      fromRaw: false,
    },
    ActionCalc: {
      priceOverrides: {},
      teas: [],
    },
    ItemLookup: {
      item: null,
      items: [],
    },
    Gathering: {
      [Skill.Milking]: gather,
      [Skill.Foraging]: gather,
      [Skill.Woodcutting]: gather,
    },
    ActionCategorySelector: {
      [Skill.Cheesesmithing]: actionCat,
      [Skill.Crafting]: actionCat,
      [Skill.Tailoring]: actionCat,
      [Skill.Cooking]: actionCat,
      [Skill.Brewing]: actionCat,
    },
    Materials: {
      priceOverrides: {},
      actions: [],
      relevantItems: [],
    },
    Enhancing: {
      item: null,
      level: 1,
      toolBonus: 0,
      gearSpeed: 0,
      teas: [],
      target: 1,
      availableTeas: [],
      items: [],
      itemOptions: [],
    },
    EnhancingCalc: {
      protCostOverride: "",
      priceOverrides: {},
    },
    Combat: {
      action: null,
      kph: 0,
    },
    CombatTable: {
      priceOverrides: {},
    },
    Market: {
      search: "",
    },
  } as unknown as UserT);

  return (
    <userInfoContext.Provider value={{ userInfo }}>
      {children}
    </userInfoContext.Provider>
  );
};

export const resetUserData = () => {
  const gather = {
    level: 1,
    toolBonus: 0,
    gearEfficiency: 0,
    teas: [""],
    priceOverrides: {},
    relevantItems: [],
  };
  const actionCat = {
    fromRaw: false,
    level: 1,
    xp: "",
    targetLevel: "",
    toolBonus: 0,
    teas: [""],
    gearEfficiency: 0,
    options: [],
  };
  return {
    tabControl: {
      current: "production",
    },
    Character: {
      character: {},
      relevantSkills: [],
      toolMap: new Map(),
    },
    Calculator: {
      action: null,
      fromRaw: false,
    },
    ActionCalc: {
      priceOverrides: {},
      teas: [],
    },
    ItemLookup: {
      item: null,
      items: [],
    },
    Gathering: {
      [Skill.Milking]: gather,
      [Skill.Foraging]: gather,
      [Skill.Woodcutting]: gather,
    },
    ActionCategorySelector: {
      [Skill.Cheesesmithing]: actionCat,
      [Skill.Crafting]: actionCat,
      [Skill.Tailoring]: actionCat,
      [Skill.Cooking]: actionCat,
      [Skill.Brewing]: actionCat,
    },
    Materials: {
      priceOverrides: {},
      actions: [],
      relevantItems: [],
    },
    Enhancing: {
      item: null,
      level: 1,
      toolBonus: 0,
      gearSpeed: 0,
      teas: [],
      target: 1,
      availableTeas: [],
      items: [],
      itemOptions: [],
    },
    EnhancingCalc: {
      protCostOverride: "",
      priceOverrides: {},
    },
    Combat: {
      action: null,
      kph: 0,
    },
    CombatTable: {
      priceOverrides: {},
    },
    Market: {
      search: "",
    },
  } as unknown as UserT;
};
