import {DeviceFieldsType} from "../DeviceProperties";
import {Slot} from "../Slot";
import {hashStr} from "../Utils";
import {DeviceOutput} from "../DeviceOutput";
import {isDeviceParameter, isRM, TypeDeviceParameter, TypeRM} from "../icTypes";
import {Ic10Error} from "../Ic10Error";
import {accessType} from "../types";
import {
    getReagent,
    getReagentMode,
    isReagent,
    Reagent,
    reverseReagentMapping
} from "../data/reagents";
import _ from "lodash";

export const IcHash = hashStr("ItemIntegratedCircuit10")

export class Device<Fields extends keyof DeviceFieldsType = keyof DeviceFieldsType> {
    public nameHash?: number;
    public properties: Pick<DeviceFieldsType, Fields | "PrefabHash">
    public propertiesAccess: { [key in TypeDeviceParameter|string]: accessType} = {}
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

type AdditionalOptions = {
    reagents: Partial<Record<TypeRM, Partial<Record<Reagent, number>>>>
}

export class DebugDevice extends Device {
    declare public properties: DeviceFieldsType

    constructor(slotCount: number, fields: Partial<DeviceFieldsType>, additionalOptions?: Partial<AdditionalOptions>) {
        super(slotCount, { PrefabHash: fields.PrefabHash ?? 0, ...fields } as DeviceFieldsType);

        const reagents = additionalOptions?.reagents ?? {}

        this.reagents = _.merge(this.reagents, reagents)
    }
}
