import InterpreterIc10 from "./main";
import { Device } from "./Device";
import { IcHousing } from "./devices/IcHousing";
export declare class Environ {
    #private;
    d0: Device;
    d1: Device;
    d2: Device;
    d3: Device;
    d4: Device;
    d5: Device;
    db: IcHousing;
    constructor(scope: InterpreterIc10);
    get(cell: string): Device;
}
