import InterpreterIc10 from "./main";
import { Environ } from "./Environ";
import { MemoryCell } from "./MemoryCell";
import { MemoryStack } from "./MemoryStack";
import { Device } from "./Device";
export declare class Memory {
    #private;
    cells: Array<MemoryCell>;
    stack: MemoryStack;
    environ: Environ;
    aliases: Record<string, MemoryCell | Device>;
    constructor(scope: InterpreterIc10);
    get scope(): InterpreterIc10 | null;
    reset(): void;
    findRegister(name: string | number): MemoryCell | undefined;
    getRegister(name: string | number): MemoryCell;
    findDevice(name: string | number): Device | undefined;
    getDevice(name: string | number): Device;
    findValue(value: string | number): number | undefined;
    getValue(value: string | number): number;
    alias(name: string | number, link: string): Memory;
    define(name: string, value: string | number): void;
    toLog(): {
        [key: string]: any;
    };
}
