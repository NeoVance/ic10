import { TypeDeviceParameter } from "./icTypes";
export type DeviceFieldsType = {
    [key in TypeDeviceParameter | string]: number;
};
export declare class DeviceFields implements Partial<DeviceFieldsType> {
    [x: string]: number | undefined;
    On: number;
    Setting: number;
}
