"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardsuit = void 0;
const Device_1 = require("../Device");
const Utils_1 = require("../Utils");
class Hardsuit extends Device_1.Device {
    constructor(scope, name) {
        super(scope, name, 8, {
            Power: 1,
            Error: 0,
            Pressure: 0,
            Temperature: 0,
            PressureExternal: 0,
            Activate: 0,
            Lock: 0,
            Setting: 0,
            RatioOxygen: 0,
            RatioCarbonDioxide: 0,
            RatioNitrogen: 0,
            RatioPollutant: 0,
            RatioVolatiles: 0,
            RatioWater: 0,
            On: 1,
            Volume: 0,
            PressureSetting: 0,
            TemperatureSetting: 0,
            TemperatureExternal: 0,
            Filtration: 0,
            AirRelease: 0,
            PositionX: 0,
            PositionY: 0,
            PositionZ: 0,
            VelocityMagnitude: 0,
            VelocityRelativeX: 0,
            VelocityRelativeY: 0,
            VelocityRelativeZ: 0,
            RatioNitrousOxide: 0,
            Combustion: 0,
            SoundAlert: 0
        });
        this.hash = (0, Utils_1.hashStr)("ItemHardSuit");
        this.slots[3].init({
            OccupantHash: (0, Utils_1.hashStr)("ItemIntegratedCircuit10"),
            Occupied: 1,
            LineNumber: 0
        });
    }
}
exports.Hardsuit = Hardsuit;
//# sourceMappingURL=HardSuit.js.map