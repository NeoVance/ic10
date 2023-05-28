import InterpreterIc10 from "./main";
import { MemoryCell } from "./MemoryCell";
export declare class ConstantCell extends MemoryCell {
    readonly value: number;
    constructor(value: number, scope: InterpreterIc10, name: string);
}
