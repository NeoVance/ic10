import { Device } from "./Device";
declare const defaultProperties: {
    Power: number;
    Error: number;
    Pressure: number;
    Temperature: number;
    PressureExternal: number;
    Activate: number;
    Lock: number;
    Setting: number;
    RatioOxygen: number;
    RatioCarbonDioxide: number;
    RatioNitrogen: number;
    RatioPollutant: number;
    RatioVolatiles: number;
    RatioWater: number;
    On: number;
    Volume: number;
    PressureSetting: number;
    TemperatureSetting: number;
    TemperatureExternal: number;
    Filtration: number;
    AirRelease: number;
    PositionX: number;
    PositionY: number;
    PositionZ: number;
    VelocityMagnitude: number;
    VelocityRelativeX: number;
    VelocityRelativeY: number;
    VelocityRelativeZ: number;
    RatioNitrousOxide: number;
    Combustion: number;
    SoundAlert: number;
    PrefabHash: number;
};
export declare class Hardsuit extends Device<keyof typeof defaultProperties> {
    constructor();
}
export {};
