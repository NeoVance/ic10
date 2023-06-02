import { DeviceFields } from "./DeviceProperties";
import InterpreterIc10 from "./main";
import { Slot } from "./Slot";
import { DeviceOutput } from "./DeviceOutput";
export declare const IcHash: number;
export declare class Device {
    #private;
    hash: number;
    name: string;
    nameHash?: number;
    properties: Partial<DeviceFields>;
    slots: Slot[];
    outputs: {
        [key: `${number}`]: DeviceOutput;
    };
    constructor(scope: InterpreterIc10, name: string, slotCount?: number, fields?: Partial<DeviceFields>);
    get scope(): InterpreterIc10;
    init(properties: Partial<DeviceFields>): void;
    has(variable: string): boolean;
    get(variable: string): number;
    set(variable: string, value: number): Device;
    getSlot(slot: number): Slot;
    getSlot(slot: number, property: string): number;
    setSlot(slot: number, property: string, value: number): void;
    getChanel(channel: number): DeviceOutput;
}
