import {Device, IcHash} from "./Device";
import {hashStr} from "../Utils";
import {DeviceFieldsType} from "../DeviceProperties";

const defaultProperties = {
    Power: 1,
    Error: 0,
    Setting: 0,
    On: 1,
    RequiredPower: 1,
    PrefabHash: hashStr("StructureCircuitHousing"),
    LineNumber: 0
} satisfies Partial<DeviceFieldsType>

export class IcHousing extends Device<keyof typeof defaultProperties> {
	constructor() {
		super(1, defaultProperties)
        this.slots[0].init({
            OccupantHash: IcHash,
            PrefabHash: IcHash,
            Occupied: 1,
            LineNumber: 0,
            Damage: 0,
            Quantity: 1,
        })
	}
}
