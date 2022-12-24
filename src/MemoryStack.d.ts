import InterpreterIc10 from "./main";
import { MemoryCell } from "./MemoryCell";
import { Device } from "./Device";
import { DeviceProperties } from "./DeviceProperties";
import { Slot } from "./Slot";
export declare class MemoryStack extends MemoryCell {
    #private;
    value: number[];
    index: number;
    constructor(scope: InterpreterIc10, name: string);
    push(value: number): MemoryStack;
    pop(): number;
    peek(): number;
    getStack(): number[];
    get(variable?: any): Device | number | DeviceProperties | Slot[];
    set(variable: any, value: any): this;
}
