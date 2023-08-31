import { createContext, useRef, useState } from "react";
import { ActionCategoryDetailMap, ItemDetail } from "../models/Client";
import { MarketValue } from "../models/Market";
import { Skill } from "./CommonFunctions";
import { TabsValue } from "@mantine/core";

type gatherT = {
  level: number;
  toolBonus: number | "";
  gearEfficiency: number | "";
  teas: string[];
  priceOverrides: { [key: string]: number | "" };
  relevantItems: (ItemDetail & MarketValue)[];
};

type actionT = {
  fromRaw: boolean;
  level: number | "";
  xp: number | "";
  targetLevel: number | "";
  toolBonus: number | "";
  teas: string[];
  gearEfficiency: number | "";
  // category: string;
};

type UserT = {
  tabControl: {
    current: TabsValue;
    previous: TabsValue;
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
    [Skill.Milking]: gatherT;
    [Skill.Foraging]: gatherT;
    [Skill.Woodcutting]: gatherT;
  };
  ActionCategorySelector: {
    [Skill.Cheesesmithing]: actionT;
    [Skill.Crafting]: actionT;
    [Skill.Tailoring]: actionT;
    [Skill.Cooking]: actionT;
    [Skill.Brewing]: actionT;
  };
  Materials: {
    priceOverrides: { [key: string]: number | "" };
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

export class UserDetails {
  tabControl: UserT["tabControl"];
  Character: UserT["Character"];
  Calculator: UserT["Calculator"];
  ActionCalc: UserT["ActionCalc"];
  ItemLookup: UserT["ItemLookup"];
  Gathering: UserT["Gathering"];
  ActionCategorySelector: UserT["ActionCategorySelector"];
  Materials: UserT["Materials"];
  Enhancing: UserT["Enhancing"];
  EnhancingCalc: UserT["EnhancingCalc"];
  Combat: UserT["Combat"];
  CombatTable: UserT["CombatTable"];
  Market: UserT["Market"];
  #rerenderer: () => void;
  constructor(f: () => void) {
    const gather: gatherT = {
      level: 1,
      toolBonus: 0,
      gearEfficiency: 0,
      teas: [""],
      priceOverrides: {},
      relevantItems: [],
    };
    const actionCat: actionT = {
      fromRaw: false,
      level: 1,
      xp: "",
      targetLevel: "",
      toolBonus: 0,
      teas: [""],
      gearEfficiency: 0,
    };
    this.tabControl = { current: "production", previous: "" };
    this.Character = { character: {}, relevantSkills: [] };
    this.Calculator = { action: null, fromRaw: false };
    this.ActionCalc = { priceOverrides: {}, teas: [] };
    this.ItemLookup = { item: null, items: [] };
    this.Gathering = {
      [Skill.Milking]: { ...gather },
      [Skill.Foraging]: { ...gather },
      [Skill.Woodcutting]: { ...gather },
    };
    this.ActionCategorySelector = {
      [Skill.Cheesesmithing]: { ...actionCat },
      [Skill.Crafting]: { ...actionCat },
      [Skill.Tailoring]: { ...actionCat },
      [Skill.Cooking]: { ...actionCat },
      [Skill.Brewing]: { ...actionCat },
    };
    this.Materials = { priceOverrides: {} };
    this.Enhancing = {
      item: null,
      level: 1,
      toolBonus: 0,
      gearSpeed: 0,
      teas: [],
      target: 1,
      availableTeas: [],
      items: [],
      itemOptions: [],
    };
    this.EnhancingCalc = { protCostOverride: "", priceOverrides: {} };
    this.Combat = { action: null, kph: 0 };
    this.CombatTable = { priceOverrides: {} };
    this.Market = { search: "" };
    this.#rerenderer = f;
  }

  nextTab(value: TabsValue) {
    this.tabControl.previous = this.tabControl.current;
    this.tabControl.current = value;
    return this;
  }

  changeCharacter(
    value:
      | UserT["Character"]
      | ((currentValue: UserT["Character"]) => UserT["Character"])
  ) {
    if (typeof value === "function") this.Character = value(this.Character);
    else this.Character = value;
    return this;
  }

  changeCalculator(
    value:
      | UserT["Calculator"]
      | ((currentValue: UserT["Calculator"]) => UserT["Calculator"])
  ) {
    if (typeof value === "function") this.Calculator = value(this.Calculator);
    else this.Calculator = value;
    return this;
  }

  changeActionCalc(
    value:
      | UserT["ActionCalc"]
      | ((currentValue: UserT["ActionCalc"]) => UserT["ActionCalc"])
  ) {
    if (typeof value === "function") this.ActionCalc = value(this.ActionCalc);
    else this.ActionCalc = value;
    return this;
  }

  changeItemLookup(
    value:
      | UserT["ItemLookup"]
      | ((currentValue: UserT["ItemLookup"]) => UserT["ItemLookup"])
  ) {
    if (typeof value === "function") this.ItemLookup = value(this.ItemLookup);
    else this.ItemLookup = value;
    return this;
  }

  changeGathering(
    skill: keyof UserT["Gathering"],
    value:
      | UserT["Gathering"][keyof UserT["Gathering"]]
      | ((
          currentValue: UserT["Gathering"][keyof UserT["Gathering"]]
        ) => UserT["Gathering"][keyof UserT["Gathering"]])
  ) {
    if (typeof value === "function")
      this.Gathering[skill] = value(this.Gathering[skill]);
    else this.Gathering[skill] = value;
    return this;
  }

  changeActionCategorySelector(
    skill: keyof UserT["ActionCategorySelector"],
    value:
      | UserT["ActionCategorySelector"][keyof UserT["ActionCategorySelector"]]
      | ((
          currentValue: UserT["ActionCategorySelector"][keyof UserT["ActionCategorySelector"]]
        ) => UserT["ActionCategorySelector"][keyof UserT["ActionCategorySelector"]])
  ) {
    if (typeof value === "function")
      this.ActionCategorySelector[skill] = value(
        this.ActionCategorySelector[skill]
      );
    else this.ActionCategorySelector[skill] = value;
    return this;
  }

  changeMaterials(
    value:
      | UserT["Materials"]
      | ((currentValue: UserT["Materials"]) => UserT["Materials"])
  ) {
    if (typeof value === "function") this.Materials = value(this.Materials);
    else this.Materials = value;
    return this;
  }

  changeEnhancing(
    value:
      | UserT["Enhancing"]
      | ((currentValue: UserT["Enhancing"]) => UserT["Enhancing"])
  ) {
    if (typeof value === "function") this.Enhancing = value(this.Enhancing);
    else this.Enhancing = value;
    return this;
  }

  changeEnhancingCalc(
    value:
      | UserT["EnhancingCalc"]
      | ((currentValue: UserT["EnhancingCalc"]) => UserT["EnhancingCalc"])
  ) {
    if (typeof value === "function")
      this.EnhancingCalc = value(this.EnhancingCalc);
    else this.EnhancingCalc = value;
    return this;
  }

  changeCombat(
    value:
      | UserT["Combat"]
      | ((currentValue: UserT["Combat"]) => UserT["Combat"])
  ) {
    if (typeof value === "function") this.Combat = value(this.Combat);
    else this.Combat = value;
    return this;
  }

  changeCombatTable(
    value:
      | UserT["CombatTable"]
      | ((currentValue: UserT["CombatTable"]) => UserT["CombatTable"])
  ) {
    if (typeof value === "function") this.CombatTable = value(this.CombatTable);
    else this.CombatTable = value;
    return this;
  }

  changeMarket(
    value:
      | UserT["Market"]
      | ((currentValue: UserT["Market"]) => UserT["Market"])
  ) {
    if (typeof value === "function") this.Market = value(this.Market);
    else this.Market = value;
    return this;
  }

  set _r(f: () => void) {
    this.#rerenderer = f;
  }

  get r() {
    this.#rerenderer();
    return this;
  }

  loadData(localStorage: Storage): boolean {
    // returns true or false on whether the local data has been successfully loaded
    const data = localStorage.getItem("userData");
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.tabControl.previous) return loadFromOldData(this, parsed); // A check on whether the data is valid for the current format of UserDetails
      this.tabControl = parsed.tabControl;
      this.Character = parsed.Character;
      this.Calculator = parsed.Calculator;
      this.ActionCalc = parsed.ActionCalc;
      this.ItemLookup = parsed.ItemLookup;
      this.Gathering = parsed.Gathering;
      this.ActionCategorySelector = parsed.ActionCategorySelector;
      this.Materials = parsed.Materials;
      this.Enhancing = parsed.Enhancing;
      this.EnhancingCalc = parsed.EnhancingCalc;
      this.Combat = parsed.Combat;
      this.CombatTable = parsed.CombatTable;
      this.Market = parsed.Market;
      return true;
    } else return false;

    function loadFromOldData(user: UserDetails, parsedData: UserT): false {
      if (parsedData.tabControl)
        user.tabControl = {
          current: parsedData.tabControl.current || "production",
          previous: parsedData.tabControl.previous || "",
        };
      if (parsedData.Character)
        user.Character = {
          character: parsedData.Character.character || {},
          relevantSkills: parsedData.Character.relevantSkills || [],
        };
      if (parsedData.Calculator)
        user.Calculator = {
          action: parsedData.Calculator.action || null,
          fromRaw: parsedData.Calculator.fromRaw || false,
        };
      if (parsedData.ActionCalc)
        user.ActionCalc = {
          priceOverrides: parsedData.ActionCalc.priceOverrides || {},
          teas: parsedData.ActionCalc.teas || [],
        };
      if (parsedData.ItemLookup)
        user.ItemLookup = {
          item: parsedData.ItemLookup.item || null,
          items: parsedData.ItemLookup.items || [],
        };
      if (parsedData.Gathering) {
        user.Gathering = {
          ...Object.entries(parsedData.Gathering).reduce((acc, [k, value]) => {
            const key = k as keyof UserT["Gathering"];
            acc[key] = {
              level: value.level || 1,
              toolBonus: value.toolBonus || 0,
              gearEfficiency: value.gearEfficiency || 0,
              teas: value.teas || [""],
              priceOverrides: value.priceOverrides || {},
              relevantItems: value.relevantItems || [],
            };
            return acc;
          }, {} as UserT["Gathering"]),
        };
      }
      if (parsedData.ActionCategorySelector) {
        user.ActionCategorySelector = {
          ...Object.entries(parsedData.ActionCategorySelector).reduce(
            (acc, [k, value]) => {
              const key = k as keyof UserT["ActionCategorySelector"];
              acc[key] = {
                fromRaw: value.fromRaw || false,
                level: value.level || 1,
                xp: value.xp || "",
                targetLevel: value.targetLevel || "",
                toolBonus: value.toolBonus || 0,
                teas: value.teas || [""],
                gearEfficiency: value.gearEfficiency || 0,
              };
              return acc;
            },
            {} as UserT["ActionCategorySelector"]
          ),
        };
      }
      if (parsedData.Materials)
        user.Materials = {
          priceOverrides: parsedData.Materials.priceOverrides || {},
        };
      if (parsedData.Enhancing)
        user.Enhancing = {
          item: parsedData.Enhancing.item || null,
          level: parsedData.Enhancing.level || 1,
          toolBonus: parsedData.Enhancing.toolBonus || 0,
          gearSpeed: parsedData.Enhancing.gearSpeed || 0,
          teas: parsedData.Enhancing.teas || [],
          target: parsedData.Enhancing.target || 1,
          availableTeas: parsedData.Enhancing.availableTeas || [],
          items: parsedData.Enhancing.items || [],
          itemOptions: parsedData.Enhancing.itemOptions || [],
        };
      if (parsedData.EnhancingCalc)
        user.EnhancingCalc = {
          protCostOverride: parsedData.EnhancingCalc.protCostOverride || "",
          priceOverrides: parsedData.EnhancingCalc.priceOverrides || {},
        };
      if (parsedData.Combat)
        user.Combat = {
          action: parsedData.Combat.action || null,
          kph: parsedData.Combat.kph || 0,
        };
      if (parsedData.CombatTable)
        user.CombatTable = {
          priceOverrides: parsedData.CombatTable.priceOverrides || {},
        };
      if (parsedData.Market)
        user.Market = {
          search: parsedData.Market.search || "",
        };
      return false;
    }
  }

  saveData(localStorage: Storage): boolean {
    try {
      const saveData = {
        tabControl: this.tabControl,
        Character: this.Character,
        Calculator: this.Calculator,
        ActionCalc: this.ActionCalc,
        ItemLookup: this.ItemLookup,
        Gathering: this.Gathering,
        ActionCategorySelector: this.ActionCategorySelector,
        Materials: this.Materials,
        Enhancing: this.Enhancing,
        EnhancingCalc: this.EnhancingCalc,
        Combat: this.Combat,
        CombatTable: this.CombatTable,
        Market: this.Market,
      };
      localStorage.setItem("userData", JSON.stringify(saveData));
      return true;
    } catch (e) {
      // not sure why this would ever fail, but it's here
      return false;
    }
  }

  resetUserData() {
    this.constructor(this.#rerenderer);
  }
}

type contextT = {
  userInfo: React.MutableRefObject<UserDetails>;
};

export const userInfoContext = createContext<contextT>({} as contextT);

export const UserInfoProvider = ({ children }) => {
  const [, render] = useState(false);
  const userInfo = useRef<UserDetails>(
    new UserDetails(() => render((x) => !x))
  );

  return (
    <userInfoContext.Provider value={{ userInfo }}>
      {children}
    </userInfoContext.Provider>
  );
};
