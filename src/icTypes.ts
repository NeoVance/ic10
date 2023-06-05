const valuesSlotParameter = [ 'ChargeRatio', 'Class', 'Damage', 'Efficiency', 'Growth', 'Health', 'Mature', 'MaxQuantity', 'OccupantHash', 'Occupied', 'Seeding', 'SortingClass' ] as const
export type TypeSlotParameter = (typeof valuesSlotParameter)[number]
export const isSlotParameter = (val: string): val is TypeSlotParameter => valuesSlotParameter.includes(val as TypeSlotParameter)
const valuesDeviceParameter = [ 'Activate', 'AirRelease', 'Bpm', 'Charge', 'ClearMemory', 'CollectableGoods', 'Color', 'Combustion', 'CombustionInput', 'CombustionLimiter', 'CombustionOutput', 'CombustionOutput2', 'CompletionRatio', 'ElevatorLevel', 'ElevatorSpeed', 'Error', 'ExportCount', 'Filtration', 'ForceWrite', 'Fuel', 'HASH("name")', 'Harvest', 'Horizontal', 'Idle', 'ImportCount', 'InterrogationProgress', 'Lock', 'Maximum', 'MineablesInQueue', 'MineablesInVicinity', 'Minimum', 'MinimumWattsToContact', 'Mode', 'NextWeatherEventTime', 'On', 'Open', 'Output', 'Plant', 'PositionX', 'PositionY', 'PositionZ', 'Power', 'PowerActual', 'PowerGeneration', 'PowerPotential', 'PowerRequired', 'PrefabHash', 'Pressure', 'PressureAir', 'PressureExternal', 'PressureInput', 'PressureInternal', 'PressureOutput', 'PressureOutput2', 'PressureSetting', 'PressureWaste', 'Quantity', 'Ratio', 'RatioCarbonDioxide', 'RatioCarbonDioxideInput', 'RatioCarbonDioxideOutput', 'RatioCarbonDioxideOutput2', 'RatioNitrogen', 'RatioNitrogenInput', 'RatioNitrogenOutput', 'RatioNitrogenOutput2', 'RatioNitrousOxide', 'RatioNitrousOxideInput', 'RatioNitrousOxideOutput', 'RatioNitrousOxideOutput2', 'RatioOxygen', 'RatioOxygenInput', 'RatioOxygenOutput', 'RatioOxygenOutput2', 'RatioPollutant', 'RatioPollutantInput', 'RatioPollutantOutput', 'RatioPollutantOutput2', 'RatioVolatiles', 'RatioVolatilesInput', 'RatioVolatilesOutput', 'RatioVolatilesOutput2', 'RatioWater', 'RatioWaterInput', 'RatioWaterOutput', 'RatioWaterOutput2', 'Reagents', 'RecipeHash', 'RequiredPower', 'ReturnFuelCost', 'Rpm', 'Setting', 'SignalID', 'SignalStrength', 'SizeX', 'SizeZ', 'SolarAngle', 'SolarIrradiance', 'SoundAlert', 'Stress', 'TargetPadIndex', 'TargetX', 'TargetY', 'TargetZ', 'Temperature', 'TemperatureExternal', 'TemperatureInput', 'TemperatureOutput', 'TemperatureOutput2', 'TemperatureSetting', 'Throttle', 'Time', 'TotalMoles', 'TotalMolesInput', 'TotalMolesOutput', 'TotalMolesOutput2', 'VelocityMagnitude', 'VelocityRelativeX', 'VelocityRelativeY', 'VelocityRelativeZ', 'Vertical', 'Volume', 'WattsReachingContact' ] as const
export type TypeDeviceParameter = (typeof valuesDeviceParameter)[number]
export const isDeviceParameter = (val: string): val is TypeDeviceParameter => valuesDeviceParameter.includes(val as TypeDeviceParameter)
const valuesFunction = [ 'abs', 'acos', 'add', 'alias', 'and', 'asin', 'atan', 'atan2', 'bap', 'bapal', 'bapz', 'bapzal', 'bdns', 'bdnsal', 'bdse', 'bdseal', 'beq', 'beqal', 'beqz', 'beqzal', 'bge', 'bgeal', 'bgez', 'bgezal', 'bgt', 'bgtal', 'bgtz', 'bgtzal', 'ble', 'bleal', 'blez', 'blezal', 'blt', 'bltal', 'bltz', 'bltzal', 'bna', 'bnaal', 'bnan', 'bnaz', 'bnazal', 'bne', 'bneal', 'bnez', 'bnezal', 'brap', 'brapz', 'brdns', 'brdse', 'breq', 'breqz', 'brge', 'brgez', 'brgt', 'brgtz', 'brle', 'brlez', 'brlt', 'brltz', 'brna', 'brnan', 'brnaz', 'brne', 'brnez', 'ceil', 'cos', 'debug', 'define', 'div', 'exp', 'floor', 'hcf', 'j', 'jal', 'jr', 'l', 'lb', 'lbn', 'lbns', 'lbs', 'log', 'lr', 'ls', 'max', 'min', 'mod', 'move', 'mul', 'nor', 'or', 'peek', 'pop', 'push', 'rand', 'return', 'round', 's', 'sap', 'sapz', 'sb', 'sbn', 'sdns', 'sdse', 'select', 'seq', 'seqz', 'sge', 'sgez', 'sgt', 'sgtz', 'sin', 'sle', 'sleep', 'slez', 'slt', 'sltz', 'sna', 'snan', 'snanz', 'snaz', 'sne', 'snez', 'sqrt', 'ss', 'stack', 'sub', 'tan', 'trunc', 'xor', 'yield' ] as const
export type TypeFunction = (typeof valuesFunction)[number]
export const isFunction = (val: string): val is TypeFunction => valuesFunction.includes(val as TypeFunction)
const valuesConst = [ 'deg2rad', 'nan', 'ninf', 'pi', 'pinf', 'rad2deg' ] as const
export type TypeConst = (typeof valuesConst)[number]
export const isConst = (val: string): val is TypeConst => valuesConst.includes(val as TypeConst)
const valuesChannel = [ 'Channel0', 'Channel1', 'Channel2', 'Channel3', 'Channel4', 'Channel5', 'Channel6', 'Channel7' ] as const
export type TypeChannel = (typeof valuesChannel)[number]
export const isChannel = (val: string): val is TypeChannel => valuesChannel.includes(val as TypeChannel)
const valuesBM = [ 'Average', 'Maximum', 'Minimum', 'Sum' ] as const
export type TypeBM = (typeof valuesBM)[number]
export const isBM = (val: string): val is TypeBM => valuesBM.includes(val as TypeBM)
const valuesRM = [ 'Contents', 'Recipe', 'Required' ] as const
export type TypeRM = (typeof valuesRM)[number]
export const isRM = (val: string): val is TypeRM => valuesRM.includes(val as TypeRM)