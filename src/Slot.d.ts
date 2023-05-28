import InterpreterIc10 from "./main";
export interface ItemProperties {
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
    LineNumber: number;
}
export declare class Slot {
    #private;
    number: number;
    properties: Partial<ItemProperties>;
    constructor(scope: InterpreterIc10, number: number, properties?: Partial<ItemProperties>);
    init(properties: Partial<ItemProperties>): void;
    get scope(): InterpreterIc10;
    has(property: string): boolean;
    get(property: string): number;
    set(property: string, value: number): void;
}
