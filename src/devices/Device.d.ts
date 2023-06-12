import { DeviceFieldsType } from "../DeviceProperties";
import { Slot } from "../Slot";
import { DeviceOutput } from "../DeviceOutput";
import { TypeDeviceParameter } from "../icTypes";
import { accessType } from "../types";
export declare const IcHash: number;
export declare class Device<Fields extends keyof DeviceFieldsType = keyof DeviceFieldsType> {
    nameHash?: number;
    properties: Pick<DeviceFieldsType, Fields | "PrefabHash">;
    propertiesAccess: {
        [key in TypeDeviceParameter | string]: accessType;
    };
    slots: Slot[];
    outputs: {
        [key: `${number}`]: DeviceOutput;
    };
    constructor(slotCount: number, fields: Pick<DeviceFieldsType, Fields | "PrefabHash">);
    has(variable: keyof DeviceFieldsType): boolean;
    get(variable: keyof DeviceFieldsType): number;
    set(variable: Fields, value: number): Device<Fields>;
    getSlot(slot: number): Slot;
    getSlot(slot: number, property: string): number;
    setSlot(slot: number, property: string, value: number): void;
    getChannel(channel: number): DeviceOutput;
}
export declare class DebugDevice extends Device {
    properties: DeviceFieldsType;
    constructor(slotCount: number, fields: Partial<DeviceFieldsType>);
}
