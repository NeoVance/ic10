import { DeviceFieldsType } from "./DeviceProperties";
import InterpreterIc10 from "./main";
import { Slot } from "./Slot";
import { DeviceOutput } from "./DeviceOutput";
export declare const IcHash: number;
export declare class Device {
    #private;
    hash: number;
    name: string;
    nameHash?: number;
    properties: Partial<DeviceFieldsType>;
    slots: Slot[];
    outputs: {
        [key: `${number}`]: DeviceOutput;
    };
    constructor(scope: InterpreterIc10, name: string, slotCount?: number, fields?: Partial<DeviceFieldsType>);
    get scope(): InterpreterIc10;
    init(properties: Partial<DeviceFieldsType>): void;
    has(variable: string): boolean;
    get(variable: string): number;
    set(variable: string, value: number): Device;
    getSlot(slot: number): Slot;
    getSlot(slot: number, property: string): number;
    setSlot(slot: number, property: string, value: number): void;
    getChannel(channel: number): DeviceOutput;
}
