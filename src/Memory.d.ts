import InterpreterIc10 from "./main";
import { Ports } from "./Ports";
import { RegisterCell } from "./RegisterCell";
import { MemoryStack } from "./MemoryStack";
import { Device } from "./Device";
import { ConstantCell } from "./ConstantCell";
import { ValueCell } from "./ValueCell";
import { DeviceOutput } from "./DeviceOutput";
export declare class Memory {
    #private;
    cells: Array<RegisterCell>;
    stack: MemoryStack;
    environ: Ports;
    aliases: Record<string, ValueCell | Device>;
    constructor(scope: InterpreterIc10);
    get scope(): InterpreterIc10 | null;
    reset(): void;
    findRegister(name: string | number): RegisterCell | ConstantCell | undefined;
    getRegister(name: string | number): RegisterCell;
    findDevice(name: string | number): Device | undefined;
    getDevice(name: string | number): Device;
    getDeviceOrDeviceOutput(name: string | number): Device | DeviceOutput;
    getDeviceOutput(name: string): DeviceOutput;
    findValue(value: string | number): number | undefined;
    getValue(value: string | number): number;
    alias(name: string | number, link: string): Memory;
    define(name: string, value: string | number): void;
    toLog(): {
        [key: string]: any;
    };
}
