import InterpreterIc10 from "./main";
import { DeviceProperties } from "./DeviceProperties";
import { Slot } from "./Slot";
import { Device } from "./Device";
export declare class MemoryCell {
    #private;
    value: any;
    name: string;
    alias: string | number | null;
    constructor(scope: InterpreterIc10, name: string);
    getName(): string | number;
    get(variable?: any): Device | number | DeviceProperties | Slot[];
    set(variable: any, value: any): MemoryCell;
}
