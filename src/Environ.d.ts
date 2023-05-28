import InterpreterIc10 from "./main";
import { Device } from "./Device";
import { Chip } from "./Chip";
export declare class Environ {
    #private;
    d0: Device;
    d1: Device;
    d2: Device;
    d3: Device;
    d4: Device;
    d5: Device;
    db: Chip;
    constructor(scope: InterpreterIc10);
    get(cell: string): Device;
}
