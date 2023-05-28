import InterpreterIc10 from "../main";
import {Device, IcHash} from "../Device";
import {hashStr} from "../Utils";

export class IcHousing extends Device {
	constructor(scope: InterpreterIc10, name: string) {
		super(scope, name, 1, {
            Power: 1,
            Error: 0,
            Setting: 0,
            On: 1,
            RequiredPower: 1,
            PrefabHash: hashStr("StructureCircuitHousing"),
            LineNumber: 0
        })
		this.hash = hashStr("StructureCircuitHousing")
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
