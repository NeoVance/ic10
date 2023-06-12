import { Ports } from "./Ports";
import { RegisterCell } from "./RegisterCell";
import { MemoryStack } from "./MemoryStack";
import { Device } from "./devices/Device";
import { ValueCell } from "./ValueCell";
import { DeviceOutput } from "./DeviceOutput";
export declare class Memory {
    cells: Array<RegisterCell>;
    stack: MemoryStack;
    environ: Ports;
    aliases: Record<string, ValueCell | Device>;
    aliasesRevert: {
        [key: string]: string;
    };
    constructor();
    reset(): void;
    findRegister(name: string | number): RegisterCell | undefined;
    getRegister(name: string | number): RegisterCell;
    findDevice(name: string | number): Device | undefined;
    getDevice(name: string | number): Device;
    getDeviceOrDeviceOutput(name: string): Device | DeviceOutput;
    getDeviceOutput(name: string): DeviceOutput;
    findValue(value: string | number): number | undefined;
    getValue(value: string | number): number;
    alias(name: string | number, link: string): Memory;
    define(name: string, value: string | number): void;
    toLog(): {
        [key: string]: any;
    };
}
