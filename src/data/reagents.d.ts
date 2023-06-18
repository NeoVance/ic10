import { TypeRM } from "../icTypes";
export declare const reagents: readonly ["Astroloy", "Hastelloy", "Inconel", "Stellite", "Waspaloy", "Constantan", "Electrum", "Invar", "Solder", "Steel", "Copper", "Gold", "Iron", "Lead", "Nickel", "Silicon", "Silver", "Hydrocarbon"];
export declare const reagentMapping: Record<"Astroloy" | "Hastelloy" | "Inconel" | "Stellite" | "Waspaloy" | "Constantan" | "Electrum" | "Invar" | "Solder" | "Steel" | "Copper" | "Gold" | "Iron" | "Lead" | "Nickel" | "Silicon" | "Silver" | "Hydrocarbon", number>;
export declare const reverseReagentMapping: Record<number, "Astroloy" | "Hastelloy" | "Inconel" | "Stellite" | "Waspaloy" | "Constantan" | "Electrum" | "Invar" | "Solder" | "Steel" | "Copper" | "Gold" | "Iron" | "Lead" | "Nickel" | "Silicon" | "Silver" | "Hydrocarbon">;
export type Reagent = (typeof reagents)[number];
export declare const isReagent: (v: string) => v is "Astroloy" | "Hastelloy" | "Inconel" | "Stellite" | "Waspaloy" | "Constantan" | "Electrum" | "Invar" | "Solder" | "Steel" | "Copper" | "Gold" | "Iron" | "Lead" | "Nickel" | "Silicon" | "Silver" | "Hydrocarbon";
export declare const getReagent: (v: string | number) => Reagent | undefined;
export declare const reagentModeMapping: {
    readonly Contents: 0;
    readonly Required: 1;
    readonly Recipe: 2;
};
export declare const reverseReagentModeMapping: Record<number, "Contents" | "Recipe" | "Required">;
export declare const getReagentMode: (v: string | number) => TypeRM | undefined;
