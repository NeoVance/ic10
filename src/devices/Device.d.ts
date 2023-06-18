import { DeviceFieldsType } from "../DeviceProperties";
import { Slot } from "../Slot";
import { DeviceOutput } from "../DeviceOutput";
import { TypeDeviceParameter, TypeRM } from "../icTypes";
import { accessType } from "../types";
import { Reagent } from "../data/reagents";
import devices from "../data/devices";
export declare const IcHash: number;
export declare class Device<Fields extends keyof DeviceFieldsType = keyof DeviceFieldsType> {
    nameHash?: number;
    properties: Pick<DeviceFieldsType, Fields | "PrefabHash">;
    propertiesAccess: {
        [key in TypeDeviceParameter | string]: accessType;
    };
    slots: Slot[];
    outputs: {
        [key: `${number}`]: DeviceOutput;
    };
    reagents: Record<TypeRM, Partial<Record<Reagent, number>>>;
    constructor(slotCount: number, fields: Pick<DeviceFieldsType, Fields | "PrefabHash">);
    has(variable: keyof DeviceFieldsType): boolean;
    get(variable: keyof DeviceFieldsType): number;
    set(variable: Fields, value: number): Device<Fields>;
    getSlot(slot: number): Slot;
    getSlot(slot: number, property: string): number;
    setSlot(slot: number, property: string, value: number): void;
    getChannel(channel: number): DeviceOutput;
    getReagent(reagentMode: TypeRM | number, reagent: Reagent | number): number;
}
export type AdditionalOptions = {
    reagents: Partial<Record<TypeRM, Partial<Record<Reagent, number>>>>;
};
export declare class DebugDevice extends Device {
    properties: DeviceFieldsType;
    constructor(slotCount: number, fields: Partial<DeviceFieldsType>, additionalOptions?: Partial<AdditionalOptions>);
}
type Devices = typeof devices;
type DeviceName = keyof Devices["devices"] & string;
type DeviceConf<Type extends DeviceName> = Devices["devices"][Type];
export declare const deviceFromConfig: <Type extends DeviceName>(type: Type) => Device<keyof DeviceConf<Type>["params"] & ("Activate" | "AirRelease" | "Bpm" | "Charge" | "ClearMemory" | "CollectableGoods" | "Color" | "Combustion" | "CombustionInput" | "CombustionLimiter" | "CombustionOutput" | "CombustionOutput2" | "CompletionRatio" | "ElevatorLevel" | "ElevatorSpeed" | "Error" | "ExportCount" | "Filtration" | "Flush" | "ForceWrite" | "Fuel" | "HASH(\"name\")" | "Harvest" | "Horizontal" | "Idle" | "ImportCount" | "InterrogationProgress" | "LineNumber" | "Lock" | "Maximum" | "MineablesInQueue" | "MineablesInVicinity" | "Minimum" | "MinimumWattsToContact" | "Mode" | "NextWeatherEventTime" | "On" | "Open" | "Output" | "Plant" | "PositionX" | "PositionY" | "PositionZ" | "Power" | "PowerActual" | "PowerGeneration" | "PowerPotential" | "PowerRequired" | "PrefabHash" | "Pressure" | "PressureAir" | "PressureExternal" | "PressureInput" | "PressureInternal" | "PressureOutput" | "PressureOutput2" | "PressureSetting" | "PressureWaste" | "Ratio" | "RatioCarbonDioxide" | "RatioCarbonDioxideInput" | "RatioCarbonDioxideOutput" | "RatioCarbonDioxideOutput2" | "RatioNitrogen" | "RatioNitrogenInput" | "RatioNitrogenOutput" | "RatioNitrogenOutput2" | "RatioNitrousOxide" | "RatioNitrousOxideInput" | "RatioNitrousOxideOutput" | "RatioNitrousOxideOutput2" | "RatioOxygen" | "RatioOxygenInput" | "RatioOxygenOutput" | "RatioOxygenOutput2" | "RatioPollutant" | "RatioPollutantInput" | "RatioPollutantOutput" | "RatioPollutantOutput2" | "RatioVolatiles" | "RatioVolatilesInput" | "RatioVolatilesOutput" | "RatioVolatilesOutput2" | "RatioWater" | "RatioWaterInput" | "RatioWaterOutput" | "RatioWaterOutput2" | "Reagents" | "RecipeHash" | "RequestHash" | "RequiredPower" | "ReturnFuelCost" | "Rpm" | "Setting" | "SettingOutput" | "SignalID" | "SignalStrength" | "SizeX" | "SizeZ" | "SolarAngle" | "SolarIrradiance" | "SoundAlert" | "Stress" | "TargetPadIndex" | "TargetX" | "TargetY" | "TargetZ" | "Temperature" | "TemperatureExternal" | "TemperatureInput" | "TemperatureOutput" | "TemperatureOutput2" | "TemperatureSetting" | "Throttle" | "Time" | "TotalMoles" | "TotalMolesInput" | "TotalMolesOutput" | "TotalMolesOutput2" | "VelocityMagnitude" | "VelocityRelativeX" | "VelocityRelativeY" | "VelocityRelativeZ" | "Vertical" | "Volume" | "WattsReachingContact") & string>;
export {};
