import InterpreterIc10 from "./main";
import { MemoryCell } from "./MemoryCell";
export declare class MemoryStack extends MemoryCell {
    #private;
    value: number;
    constructor(scope: InterpreterIc10, size: number, name: string);
    push(value: number): MemoryStack;
    pop(): number;
    peek(): number;
    getStack(): number[];
}
