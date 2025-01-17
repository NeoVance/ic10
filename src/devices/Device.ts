import {DeviceFieldsType} from "../DeviceProperties";
import {Slot} from "../Slot";
import {hashStr} from "../Utils";
import {DeviceOutput} from "../DeviceOutput";
import {isDeviceParameter, TypeDeviceParameter, TypeRM, valuesDeviceParameter} from "../icTypes";
import {Ic10Error} from "../Ic10Error";
import {accessType} from "../types";
import {getReagent, getReagentMode, Reagent} from "../data/reagents";
import _ from "lodash";
import devices from "../data/devices";

export const IcHash = hashStr("ItemIntegratedCircuit10")

export class Device<Fields extends keyof DeviceFieldsType = keyof DeviceFieldsType> {
    public nameHash?: number;
    public properties: Pick<DeviceFieldsType, Fields | "PrefabHash">
    public propertiesAccess: { [key in TypeDeviceParameter | string]: accessType } = {}
    public slots: Slot[]
    public outputs: { [key: `${number}`]: DeviceOutput } = {}
    public reagents: Record<TypeRM, Partial<Record<Reagent, number>>> = {
        Contents: {},
        Recipe: {},
        Required: {}
    }

    constructor(slotCount: number, fields: Pick<DeviceFieldsType, Fields | "PrefabHash">) {
        this.properties = fields
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot(i))
    }

    get name() {
        if (!this.properties.PrefabHash) {
            return 'Unknown'
        }

        const assoc = devices.assoc as Record<number, string>

        if (assoc[this.properties.PrefabHash])
            return assoc[this.properties.PrefabHash]

        return this.properties.PrefabHash

    }

    has(variable: keyof DeviceFieldsType) {
        return (variable in this.properties)
    }

    get(variable: keyof DeviceFieldsType): number {
        if (!this.has(variable))
            throw new Ic10Error('Unknown variable', variable)

        return (this.properties as Record<string, number>)[variable]
    }

    set(variable: Fields, value: number): Device<Fields> {
        if (!isDeviceParameter(variable))
            throw new Ic10Error('Unknown variable', variable);

        const r: Record<keyof DeviceFieldsType, number> = this.properties

        r[variable] = value

        return this
    }

    getSlot(slot: number): Slot
    getSlot(slot: number, property: string): number
    getSlot(slot: number, property?: string): Slot | number {
        const s = this.slots[slot]

        if (s === undefined)
            throw new Ic10Error('Unknown slot', slot)

        if (property === undefined)
            return s

        return s.get(property)
    }

    setSlot(slot: number, property: string, value: number): void
    setSlot(slot: number, property: string, value: number) {
        const s = this.slots[slot]

        if (s === undefined)
            throw new Ic10Error('Unknown slot', slot)

        s.set(property, value)
    }

    getChannel(channel: number): DeviceOutput {
        const ch = String(channel) as `${number}`;
        const o: DeviceOutput = this.outputs[ch]
        if (o === undefined)
            this.outputs[ch] = new DeviceOutput(this)
        return this.outputs[ch]
    }

    getReagent(reagentMode: TypeRM | number, reagent: Reagent | number): number {
        const rm = getReagentMode(reagentMode)

        if (rm === undefined)
            throw new Ic10Error("Unknown reagent mode", reagentMode)

        const r = getReagent(reagent)

        if (r === undefined)
            throw new Ic10Error("Unknown reagent", reagent)

        return this.reagents[rm][r] ?? 0
    }
}

export type AdditionalOptions = {
    reagents: Partial<Record<TypeRM, Partial<Record<Reagent, number>>>>
}

export class DebugDevice extends Device {
    declare public properties: DeviceFieldsType

    constructor(slotCount: number, fields: Partial<DeviceFieldsType>, additionalOptions?: Partial<AdditionalOptions>) {
        super(slotCount, {PrefabHash: fields.PrefabHash ?? 0, ...fields} as DeviceFieldsType);

        const reagents = additionalOptions?.reagents ?? {}

        this.reagents = _.merge(this.reagents, reagents)
    }
}

type Devices = typeof devices
type DeviceName = keyof Devices["devices"] & string
type DeviceConf<Type extends DeviceName> = Devices["devices"][Type]

//TODO: create base class to store prefab name
export const deviceFromConfig = <Type extends DeviceName>(type: Type) => {
    const d = devices.devices[type]

    type Fields = Record<keyof DeviceConf<Type>["params"] & TypeDeviceParameter & string, number>

    //get all properties with initial value
    const fields: Fields = _.pick(d, valuesDeviceParameter) as Fields

    //fill rest with 0
    for (const prop in d.params) {
        if (fields[prop as keyof Fields] !== undefined)
            continue

        fields[prop as keyof Fields] = 0
    }

    return new Device<keyof DeviceConf<Type>["params"] & TypeDeviceParameter & string>(d.slot_count, fields)
}