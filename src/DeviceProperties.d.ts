import { TypeDeviceParameter } from "./icTypes";
export type DeviceFieldsType = {
    [key in TypeDeviceParameter | string]: number;
};
