import InterpreterIc10 from "./main";
export declare class Slot {
    #private;
    number: number;
    properties: {
        Charge: number;
        ChargeRatio: number;
        Class: number;
        Damage: number;
        Efficiency: number;
        Growth: number;
        Health: number;
        Mature: number;
        MaxQuantity: number;
        OccupantHash: number;
        Occupied: number;
        PrefabHash: number;
        Pressure: number;
        PressureAir: number;
        PressureWaste: number;
        Quantity: number;
        Temperature: number;
        [key: string]: number;
    };
    constructor(scope: InterpreterIc10, number: number);
    get scope(): InterpreterIc10;
    get(op1: string): number;
    set(op1: string, value: any): void;
}
