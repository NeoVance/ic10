import { Scope } from "./core";
export declare const BatchModes: {
    readonly Average: 0;
    readonly Sum: 1;
    readonly Minimum: 2;
    readonly Maximum: 3;
};
export declare const makeDeviceCommands: (scope: Scope) => {
    l: (register: string, device: string, property: string) => void;
    ls: (register: string, device: string, slot: string, property: string) => void;
    s: (device: string, property: string, value: string) => void;
    lb: (register: string, deviceHash: string, property: string, mode: string) => void;
    lr: (register: string, device: string, mode: string, property: string) => never;
    sb: (deviceHash: string, property: string, value: string) => void;
    lbn: (targetRegister: string, deviceHash: string, nameHash: string, property: string, batchMode: string) => void;
    sbn: (deviceHash: string, nameHash: string, property: string, value: string) => void;
    lbs: (register: string, deviceHash: string, slotIndex: string, property: string, batchMode: string) => void;
    lbns: (register: string, deviceHash: string, nameHash: string, slotIndex: string, property: string, batchMode: string) => void;
    ss: (device: string, slotIndex: string, property: string, value: string) => void;
    sbs: (deviceHash: string, slotIndex: string, property: string, value: string) => void;
};
