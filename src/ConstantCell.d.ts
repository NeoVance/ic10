import InterpreterIc10 from "./main";
import { MemoryCell } from "./MemoryCell";
export declare class ConstantCell extends MemoryCell {
    #private;
    value: any;
    constructor(value: any, scope: InterpreterIc10, name: string);
    get(): any;
    set(value: any, _?: any): this;
}
