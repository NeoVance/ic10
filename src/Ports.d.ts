import { Device } from "./devices/Device";
export declare class Ports {
    d0?: Device;
    d1?: Device;
    d2?: Device;
    d3?: Device;
    d4?: Device;
    d5?: Device;
    db: Device<"Error">;
    constructor();
    get(d: "db"): Device;
    get(d: string): Device | undefined;
    set(d: string, device: Device): Device<string>;
}
