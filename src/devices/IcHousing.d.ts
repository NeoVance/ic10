import { Device } from "./Device";
declare const defaultProperties: {
    Power: number;
    Error: number;
    Setting: number;
    On: number;
    RequiredPower: number;
    PrefabHash: number;
    LineNumber: number;
};
export declare class IcHousing extends Device<keyof typeof defaultProperties> {
    constructor();
}
export {};
