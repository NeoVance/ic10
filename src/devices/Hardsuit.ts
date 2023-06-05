import {Device} from "../Device";
import {hashStr} from "../Utils";
import {DeviceFieldsType} from "../DeviceProperties";

const defaultProperties = {
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
    SoundAlert: 0,
    PrefabHash: hashStr("ItemHardSuit")
} satisfies DeviceFieldsType

export class Hardsuit extends Device<keyof typeof defaultProperties> {
    constructor() {
        super(8, defaultProperties)
        //TODO: init all slots
        this.slots[3].init({
            OccupantHash: hashStr("ItemIntegratedCircuit10"),
            Occupied: 1,
            LineNumber: 0
        })
    }
}