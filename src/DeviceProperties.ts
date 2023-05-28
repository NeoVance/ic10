import InterpreterIc10 from "./main";
import {Slot}          from "./Slot";

export interface DeviceFields {
	hash: number
	Activate: number
	AirRelease: number
	Bpm: number
	Charge: number
	ClearMemory: number
	CollectableGoods: number
	Color: number
	Combustion: number
	CompletionRatio: number
	CurrentResearchPodType: number
	ElevatorLevel: number
	ElevatorSpeed: number
	Error: number
	ExportCount: number
	Filtration: number
	ForceWrite: number
	Fuel: number
	Harvest: number
	Horizontal: number
	HorizontalRatio: number
	Idle: number
	ImportCount: number
	Lock: number
	ManualResearchRequiredPod: number
	Maximum: number
	MineablesInQueue: number
	MineablesInVicinity: number
	Mode: number
	NextWeatherEventTime: number
	On: number
	Open: number
	Output: number
	Plant: number
	PositionX: number
	PositionY: number
	PositionZ: number
	Power: number
	PowerActual: number
	PowerGeneration: number
	PowerPotential: number
	PowerRequired: number
	PrefabHash: number
	Pressure: number
	PressureExternal: number
	PressureSetting: number
	Quantity: number
	Ratio: number
	RatioCarbonDioxide: number
	RatioNitrogen: number
	RatioNitrousOxide: number
	RatioOxygen: number
	RatioPollutant: number
	RatioVolatiles: number
	RatioWater: number
	Reagents: number
	RecipeHash: number
	RequestHash: number
	RequiredPower: number
	ReturnFuelCost: number
	Setting: number
	SettingInput: number
	SettingOutput: number
	SignalID: number
	SignalStrength: number
	SolarAngle: number
	TargetX: number
	TargetY: number
	TargetZ: number
	Temperature: number
	TemperatureExternal: number
	TemperatureSetting: number
	Time: number
	TotalMoles: number
	VelocityMagnitude: number
	VelocityRelativeX: number
	VelocityRelativeY: number
	VelocityRelativeZ: number
	Vertical: number
	VerticalRatio: number
	Volume: number
}

export class DeviceProperties implements DeviceFields{


	constructor(scope: InterpreterIc10) {
		this.On                        = 0
		this.Power                     = 0
		this.Error                     = 0
		this.Activate                  = 0
		this.Setting                   = 0
		this.RequiredPower             = 0
		this.ClearMemory               = 0
		this.Lock                      = 0
		this.slots                     = new Array<Slot>(10)
		this.RecipeHash                = -128473777
		//------
		this.AirRelease                = 0
		this.Bpm                       = 0
		this.Charge                    = 0
		this.ClearMemory               = 0
		this.CollectableGoods          = 0
		this.Color                     = 0
		this.Combustion                = 0
		this.CompletionRatio           = 0
		this.CurrentResearchPodType    = 0
		this.ElevatorLevel             = 0
		this.ElevatorSpeed             = 0
		this.Error                     = 0
		this.ExportCount               = 0
		this.Filtration                = 0
		this.ForceWrite                = 0
		this.Fuel                      = 0
		this.Harvest                   = 0
		this.Horizontal                = 0
		this.HorizontalRatio           = 0
		this.Idle                      = 0
		this.ImportCount               = 0
		this.Lock                      = 0
		this.ManualResearchRequiredPod = 0
		this.Maximum                   = 0
		this.MineablesInQueue          = 0
		this.MineablesInVicinity       = 0
		this.Mode                      = 0
		this.NextWeatherEventTime      = 0
		this.On                        = 0
		this.Open                      = 0
		this.Output                    = 0
		this.Plant                     = 0
		this.PositionX                 = 0
		this.PositionY                 = 0
		this.PositionZ                 = 0
		this.Power                     = 0
		this.PowerActual               = 0
		this.PowerGeneration           = 0
		this.PowerPotential            = 0
		this.PowerRequired             = 0
		this.PrefabHash                = 0
		this.Pressure                  = 0
		this.PressureExternal          = 0
		this.PressureSetting           = 0
		this.Quantity                  = 0
		this.Ratio                     = 0
		this.RatioCarbonDioxide        = 0
		this.RatioNitrogen             = 0
		this.RatioNitrousOxide         = 0
		this.RatioOxygen               = 0
		this.RatioPollutant            = 0
		this.RatioVolatiles            = 0
		this.RatioWater                = 0
		this.Reagents                  = 0
		this.RecipeHash                = 0
		this.RequestHash               = 0
		this.RequiredPower             = 0
		this.ReturnFuelCost            = 0
		this.Setting                   = 0
		this.SettingInput              = 0
		this.SettingOutput             = 0
		this.SignalID                  = 0
		this.SignalStrength            = 0
		this.SolarAngle                = 0
		this.TargetX                   = 0
		this.TargetY                   = 0
		this.TargetZ                   = 0
		this.Temperature               = 0
		this.TemperatureExternal       = 0
		this.TemperatureSetting        = 0
		this.Time                      = 0
		this.TotalMoles                = 0
		this.VelocityMagnitude         = 0
		this.VelocityRelativeX         = 0
		this.VelocityRelativeY         = 0
		this.VelocityRelativeZ         = 0
		this.Vertical                  = 0
		this.VerticalRatio             = 0
		this.Volume                    = 0
		this.randomize()
		for (let i = 0; i < 10; i++) {
			this.slots[i] = new Slot(scope, i)
		}
	}

	slots: Slot[];
    Activate: number;
    AirRelease: number;
    Bpm: number;
    Charge: number;
    ClearMemory: number;
    CollectableGoods: number;
    Color: number;
    Combustion: number;
    CompletionRatio: number;
    CurrentResearchPodType: number;
    ElevatorLevel: number;
    ElevatorSpeed: number;
    Error: number;
    ExportCount: number;
    Filtration: number;
    ForceWrite: number;
    Fuel: number;
    Harvest: number;
    Horizontal: number;
    HorizontalRatio: number;
    Idle: number;
    ImportCount: number;
    Lock: number;
    ManualResearchRequiredPod: number;
    Maximum: number;
    MineablesInQueue: number;
    MineablesInVicinity: number;
    Mode: number;
    NextWeatherEventTime: number;
    On: number;
    Open: number;
    Output: number;
    Plant: number;
    PositionX: number;
    PositionY: number;
    PositionZ: number;
    Power: number;
    PowerActual: number;
    PowerGeneration: number;
    PowerPotential: number;
    PowerRequired: number;
    PrefabHash: number;
    Pressure: number;
    PressureExternal: number;
    PressureSetting: number;
    Quantity: number;
    Ratio: number;
    RatioCarbonDioxide: number;
    RatioNitrogen: number;
    RatioNitrousOxide: number;
    RatioOxygen: number;
    RatioPollutant: number;
    RatioVolatiles: number;
    RatioWater: number;
    Reagents: number;
    RecipeHash: number;
    RequestHash: number;
    RequiredPower: number;
    ReturnFuelCost: number;
    Setting: number;
    SettingInput: number;
    SettingOutput: number;
    SignalID: number;
    SignalStrength: number;
    SolarAngle: number;
    TargetX: number;
    TargetY: number;
    TargetZ: number;
    Temperature: number;
    TemperatureExternal: number;
    TemperatureSetting: number;
    Time: number;
    TotalMoles: number;
    VelocityMagnitude: number;
    VelocityRelativeX: number;
    VelocityRelativeY: number;
    VelocityRelativeZ: number;
    Vertical: number;
    VerticalRatio: number;
    Volume: number;
	hash: number = 0;


	randomize() {
		this.ClearMemory = 0
	}

	get(key: keyof DeviceFields):number|Slot[] {
		return this[key]
	}

	set(key: keyof DeviceProperties, value: Slot[] & number & (() => void) & ((key: keyof DeviceProperties) => number | Slot[] | (() => void) | any | ((key: keyof DeviceProperties, value: any) => void)) & ((key: keyof DeviceProperties, value: any) => void)) {
		this[key] = value
	}

}
