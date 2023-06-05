import { Device } from "./Device";
export declare class DeviceOutput {
    device: Device;
    constructor(device: Device);
    Channel0: number;
    Channel1: number;
    Channel2: number;
    Channel3: number;
    Channel4: number;
    Channel5: number;
    Channel6: number;
    Channel7: number;
    Channel8: number;
    get(property: string): number;
    set(property: string, value: number): DeviceOutput;
    isEmpty(): boolean;
    toArray(): number[];
}
