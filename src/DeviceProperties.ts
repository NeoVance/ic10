import {TypeDeviceParameter} from "./icTypes";

export type DeviceFieldsType = {
    [key in TypeDeviceParameter|string]: number;
};

export class DeviceFields implements Partial<DeviceFieldsType> {
    [x: string]: number | undefined;
	On = 0;
    Setting = 0;
}
