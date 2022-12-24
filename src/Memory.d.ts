import InterpreterIc10 from "./main";
import { Environ } from "./Environ";
import { MemoryCell } from "./MemoryCell";
import { MemoryStack } from "./MemoryStack";
import { Device } from "./Device";
import { ConstantCell } from "./ConstantCell";
import { IntRange } from "./types";
export declare class Memory {
    #private;
    cells: Array<MemoryCell | MemoryStack>;
    environ: Environ;
    aliases: {
        [key: string]: MemoryCell | Device | ConstantCell;
    };
    constructor(scope: InterpreterIc10);
    get scope(): InterpreterIc10 | null;
    cell(cell: string | number, op1?: any, op2?: any): MemoryCell | any;
    getCell(cell: 'sp'): MemoryStack;
    getCell(cell: 'r16'): MemoryStack;
    getCell(cell: `d${IntRange<0, 6>}`): Device;
    getCell(cell: `r${IntRange<0, 16>}`): MemoryCell;
    getCell(cell: number): number;
    getCell(cell: string | number): MemoryCell | MemoryStack | Device | number;
    getCell(cell: any): MemoryCell | MemoryStack | Device | number;
    alias(name: string | number, link: string | number): this;
    define(name: string, value: string | number): void;
    toLog(): {
        [key: string]: any;
    };
}
