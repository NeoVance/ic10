import { RegisterCell } from "./RegisterCell";
export declare class MemoryStack extends RegisterCell {
    #private;
    value: number;
    constructor(size: number, name: string);
    push(value: number): MemoryStack;
    pop(): number;
    peek(): number;
    getStack(): number[];
}
