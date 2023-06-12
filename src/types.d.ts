import { Device } from "./devices/Device";
import { IcHousing } from "./devices/IcHousing";
import { Slot } from "./Slot";
import { DeviceOutput } from "./DeviceOutput";
import { TypeDeviceParameter } from "./icTypes";
export type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;
export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
export type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;
export type accessType = 'read|write' | 'read' | 'write';
export type DeviceDataType = {
    assoc: {
        [P: string | `${number}`]: string | number;
    };
    devices: {
        [P: string]: {
            PrefabHash: number;
            params: {
                [key in TypeDeviceParameter | string]: accessType;
            };
            name: string;
            description: string;
            slot_count: number;
        };
    };
};
export declare function isDevice(val: any): val is Device;
export declare function isIcHousing(val: any): val is IcHousing;
export declare function isSlot(val: any): val is Slot;
export declare function isDeviceOutput(val: any): val is DeviceOutput;
