import InterpreterIc10 from "./main";
import { RegisterCell } from "./RegisterCell";
export declare class MemoryStack extends RegisterCell {
    #private;
    value: number;
    constructor(scope: InterpreterIc10, size: number, name: string);
    push(value: number): MemoryStack;
    pop(): number;
    peek(): number;
    getStack(): number[];
}
