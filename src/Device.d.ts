import { DeviceFields } from "./DeviceProperties";
import InterpreterIc10 from "./main";
import { Slot } from "./Slot";
export declare class Device {
    #private;
    number: number;
    hash: number;
    name: string;
    properties: Partial<DeviceFields>;
    slots: Slot[];
    constructor(scope: InterpreterIc10, name: string, number: number, slotCount?: number, fields?: DeviceFields);
    get scope(): InterpreterIc10;
    get(variable: string): number;
    set(variable: string, value: number): Device;
    getSlot(slot: number): Slot;
    getSlot(slot: number, property: string): number;
    setSlot(slot: number, property: string, value: number): void;
}
