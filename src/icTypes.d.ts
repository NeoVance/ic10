declare const valuesSlotParameter: readonly ["ChargeRatio", "Class", "Damage", "Efficiency", "Growth", "Health", "Mature", "MaxQuantity", "OccupantHash", "Occupied", "Quantity", "Seeding", "SortingClass"];
export type TypeSlotParameter = (typeof valuesSlotParameter)[number];
export declare const isSlotParameter: (val: string) => val is "OccupantHash" | "ChargeRatio" | "Class" | "Damage" | "Efficiency" | "Growth" | "Health" | "Mature" | "MaxQuantity" | "Occupied" | "Quantity" | "Seeding" | "SortingClass";
declare const valuesDeviceParameter: readonly ["Activate", "AirRelease", "Bpm", "Charge", "ClearMemory", "CollectableGoods", "Color", "Combustion", "CombustionInput", "CombustionLimiter", "CombustionOutput", "CombustionOutput2", "CompletionRatio", "ElevatorLevel", "ElevatorSpeed", "Error", "ExportCount", "Filtration", "Flush", "ForceWrite", "Fuel", "HASH(\"name\")", "Harvest", "Horizontal", "Idle", "ImportCount", "InterrogationProgress", "LineNumber", "Lock", "Maximum", "MineablesInQueue", "MineablesInVicinity", "Minimum", "MinimumWattsToContact", "Mode", "NextWeatherEventTime", "On", "Open", "Output", "Plant", "PositionX", "PositionY", "PositionZ", "Power", "PowerActual", "PowerGeneration", "PowerPotential", "PowerRequired", "PrefabHash", "Pressure", "PressureAir", "PressureExternal", "PressureInput", "PressureInternal", "PressureOutput", "PressureOutput2", "PressureSetting", "PressureWaste", "Ratio", "RatioCarbonDioxide", "RatioCarbonDioxideInput", "RatioCarbonDioxideOutput", "RatioCarbonDioxideOutput2", "RatioNitrogen", "RatioNitrogenInput", "RatioNitrogenOutput", "RatioNitrogenOutput2", "RatioNitrousOxide", "RatioNitrousOxideInput", "RatioNitrousOxideOutput", "RatioNitrousOxideOutput2", "RatioOxygen", "RatioOxygenInput", "RatioOxygenOutput", "RatioOxygenOutput2", "RatioPollutant", "RatioPollutantInput", "RatioPollutantOutput", "RatioPollutantOutput2", "RatioVolatiles", "RatioVolatilesInput", "RatioVolatilesOutput", "RatioVolatilesOutput2", "RatioWater", "RatioWaterInput", "RatioWaterOutput", "RatioWaterOutput2", "Reagents", "RecipeHash", "RequestHash", "RequiredPower", "ReturnFuelCost", "Rpm", "Setting", "SettingOutput", "SignalID", "SignalStrength", "SizeX", "SizeZ", "SolarAngle", "SolarIrradiance", "SoundAlert", "Stress", "TargetPadIndex", "TargetX", "TargetY", "TargetZ", "Temperature", "TemperatureExternal", "TemperatureInput", "TemperatureOutput", "TemperatureOutput2", "TemperatureSetting", "Throttle", "Time", "TotalMoles", "TotalMolesInput", "TotalMolesOutput", "TotalMolesOutput2", "VelocityMagnitude", "VelocityRelativeX", "VelocityRelativeY", "VelocityRelativeZ", "Vertical", "Volume", "WattsReachingContact"];
export type TypeDeviceParameter = (typeof valuesDeviceParameter)[number];
export declare const isDeviceParameter: (val: string) => val is "Activate" | "AirRelease" | "Bpm" | "Charge" | "ClearMemory" | "CollectableGoods" | "Color" | "Combustion" | "CombustionInput" | "CombustionLimiter" | "CombustionOutput" | "CombustionOutput2" | "CompletionRatio" | "ElevatorLevel" | "ElevatorSpeed" | "Error" | "ExportCount" | "Filtration" | "Flush" | "ForceWrite" | "Fuel" | "HASH(\"name\")" | "Harvest" | "Horizontal" | "Idle" | "ImportCount" | "InterrogationProgress" | "LineNumber" | "Lock" | "Maximum" | "MineablesInQueue" | "MineablesInVicinity" | "Minimum" | "MinimumWattsToContact" | "Mode" | "NextWeatherEventTime" | "On" | "Open" | "Output" | "Plant" | "PositionX" | "PositionY" | "PositionZ" | "Power" | "PowerActual" | "PowerGeneration" | "PowerPotential" | "PowerRequired" | "PrefabHash" | "Pressure" | "PressureAir" | "PressureExternal" | "PressureInput" | "PressureInternal" | "PressureOutput" | "PressureOutput2" | "PressureSetting" | "PressureWaste" | "Ratio" | "RatioCarbonDioxide" | "RatioCarbonDioxideInput" | "RatioCarbonDioxideOutput" | "RatioCarbonDioxideOutput2" | "RatioNitrogen" | "RatioNitrogenInput" | "RatioNitrogenOutput" | "RatioNitrogenOutput2" | "RatioNitrousOxide" | "RatioNitrousOxideInput" | "RatioNitrousOxideOutput" | "RatioNitrousOxideOutput2" | "RatioOxygen" | "RatioOxygenInput" | "RatioOxygenOutput" | "RatioOxygenOutput2" | "RatioPollutant" | "RatioPollutantInput" | "RatioPollutantOutput" | "RatioPollutantOutput2" | "RatioVolatiles" | "RatioVolatilesInput" | "RatioVolatilesOutput" | "RatioVolatilesOutput2" | "RatioWater" | "RatioWaterInput" | "RatioWaterOutput" | "RatioWaterOutput2" | "Reagents" | "RecipeHash" | "RequestHash" | "RequiredPower" | "ReturnFuelCost" | "Rpm" | "Setting" | "SettingOutput" | "SignalID" | "SignalStrength" | "SizeX" | "SizeZ" | "SolarAngle" | "SolarIrradiance" | "SoundAlert" | "Stress" | "TargetPadIndex" | "TargetX" | "TargetY" | "TargetZ" | "Temperature" | "TemperatureExternal" | "TemperatureInput" | "TemperatureOutput" | "TemperatureOutput2" | "TemperatureSetting" | "Throttle" | "Time" | "TotalMoles" | "TotalMolesInput" | "TotalMolesOutput" | "TotalMolesOutput2" | "VelocityMagnitude" | "VelocityRelativeX" | "VelocityRelativeY" | "VelocityRelativeZ" | "Vertical" | "Volume" | "WattsReachingContact";
declare const valuesFunction: readonly ["abs", "acos", "add", "alias", "and", "asin", "atan", "atan2", "bap", "bapal", "bapz", "bapzal", "bdns", "bdnsal", "bdse", "bdseal", "beq", "beqal", "beqz", "beqzal", "bge", "bgeal", "bgez", "bgezal", "bgt", "bgtal", "bgtz", "bgtzal", "ble", "bleal", "blez", "blezal", "blt", "bltal", "bltz", "bltzal", "bna", "bnaal", "bnan", "bnaz", "bnazal", "bne", "bneal", "bnez", "bnezal", "brap", "brapz", "brdns", "brdse", "breq", "breqz", "brge", "brgez", "brgt", "brgtz", "brle", "brlez", "brlt", "brltz", "brna", "brnan", "brnaz", "brne", "brnez", "ceil", "cos", "debug", "define", "div", "exp", "floor", "hcf", "j", "jal", "jr", "l", "lb", "lbn", "lbns", "lbs", "log", "lr", "ls", "max", "min", "mod", "move", "mul", "nor", "or", "peek", "pop", "push", "rand", "return", "round", "s", "sap", "sapz", "sb", "sbn", "sbs", "sdns", "sdse", "select", "seq", "seqz", "sge", "sgez", "sgt", "sgtz", "sin", "sla", "sle", "sleep", "slez", "sll", "slt", "sltz", "sna", "snan", "snanz", "snaz", "sne", "snez", "sqrt", "sra", "srl", "ss", "stack", "sub", "tan", "trunc", "xor", "yield"];
export type TypeFunction = (typeof valuesFunction)[number];
export declare const isFunction: (val: string) => val is "hcf" | "debug" | "l" | "ls" | "s" | "lb" | "lr" | "sb" | "lbn" | "sbn" | "lbs" | "lbns" | "ss" | "sbs" | "seq" | "seqz" | "sge" | "sgez" | "sgt" | "sgtz" | "sle" | "slez" | "slt" | "sltz" | "sne" | "snez" | "sap" | "sapz" | "sna" | "snaz" | "sdse" | "sdns" | "snan" | "snanz" | "j" | "jr" | "jal" | "beq" | "beqz" | "bge" | "bgez" | "bgt" | "bgtz" | "ble" | "blez" | "blt" | "bltz" | "bne" | "bnez" | "bap" | "bapz" | "bna" | "bnaz" | "bdse" | "bdns" | "bnan" | "breq" | "breqz" | "brge" | "brgez" | "brgt" | "brgtz" | "brle" | "brlez" | "brlt" | "brltz" | "brne" | "brnez" | "brap" | "brapz" | "brna" | "brnaz" | "brdse" | "brdns" | "brnan" | "beqal" | "beqzal" | "bgeal" | "bgezal" | "bgtal" | "bgtzal" | "bleal" | "blezal" | "bltal" | "bltzal" | "bneal" | "bnezal" | "bapal" | "bapzal" | "bnaal" | "bnazal" | "bdseal" | "bdnsal" | "pop" | "push" | "sub" | "max" | "add" | "xor" | "round" | "move" | "div" | "select" | "abs" | "acos" | "alias" | "and" | "asin" | "atan" | "atan2" | "ceil" | "cos" | "define" | "exp" | "floor" | "log" | "min" | "mod" | "mul" | "nor" | "or" | "peek" | "rand" | "return" | "sin" | "sla" | "sleep" | "sll" | "sqrt" | "sra" | "srl" | "stack" | "tan" | "trunc" | "yield";
declare const valuesConst: readonly ["deg2rad", "nan", "ninf", "pi", "pinf", "rad2deg"];
export type TypeConst = (typeof valuesConst)[number];
export declare const isConst: (val: string) => val is "nan" | "deg2rad" | "ninf" | "pi" | "pinf" | "rad2deg";
declare const valuesChannel: readonly ["Channel0", "Channel1", "Channel2", "Channel3", "Channel4", "Channel5", "Channel6", "Channel7"];
export type TypeChannel = (typeof valuesChannel)[number];
export declare const isChannel: (val: string) => val is "Channel0" | "Channel1" | "Channel2" | "Channel3" | "Channel4" | "Channel5" | "Channel6" | "Channel7";
declare const valuesBM: readonly ["Average", "Maximum", "Minimum", "Sum"];
export type TypeBM = (typeof valuesBM)[number];
export declare const isBM: (val: string) => val is "Maximum" | "Minimum" | "Average" | "Sum";
declare const valuesRM: readonly ["Contents", "Recipe", "Required"];
export type TypeRM = (typeof valuesRM)[number];
export declare const isRM: (val: string) => val is "Contents" | "Recipe" | "Required";
export declare const isKeyword: (s: string) => boolean;
export {};
