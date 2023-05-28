"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcHousing = void 0;
const Device_1 = require("../Device");
const Utils_1 = require("../Utils");
class IcHousing extends Device_1.Device {
    constructor(scope, name) {
        super(scope, name, 1, {
            Power: 1,
            Error: 0,
            Setting: 0,
            On: 1,
            RequiredPower: 1,
            PrefabHash: (0, Utils_1.hashStr)("StructureCircuitHousing"),
            LineNumber: 0
        });
        this.hash = (0, Utils_1.hashStr)("StructureCircuitHousing");
        this.slots[0].init({
            OccupantHash: Device_1.IcHash,
            PrefabHash: Device_1.IcHash,
            Occupied: 1,
            LineNumber: 0,
            Damage: 0,
            Quantity: 1,
        });
    }
}
exports.IcHousing = IcHousing;
//# sourceMappingURL=IcHousing.js.map