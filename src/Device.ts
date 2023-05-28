import {DeviceFields} from "./DeviceProperties";
import InterpreterIc10, {Execution}     from "./main";
import {Slot}                       from "./Slot";
import {hashStr} from "./Utils";

export const IcHash = hashStr("ItemIntegratedCircuit10")

export class Device {
	public hash: number;
    public name: string;
	public properties: Partial<DeviceFields>
    public slots: Slot[]
	readonly #scope: InterpreterIc10

	constructor(scope: InterpreterIc10, name: string, slotCount?: number, fields?: Partial<DeviceFields>) {
        this.name = name
		this.#scope     = scope;
		this.hash       = 0
		this.#scope     = scope
		this.properties = fields ?? {}
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot(scope, i))

        if (this.properties.PrefabHash !== undefined)
            this.hash = this.properties.PrefabHash
	}

	get scope(): InterpreterIc10 {
		return this.#scope;
	}

    init(properties: Partial<DeviceFields>) {
        this.properties = properties
    }

    has(variable: string) {
        return (variable in this.properties)
    }

	get(variable: string): number  {
		if (variable == 'hash') {
			return this.hash
		}

		if (!this.has(variable))
            throw Execution.error(this.#scope.position, 'Unknown variable', variable)

        return (this.properties as Record<string, number>)[variable]
	}

	set(variable: string, value: number): Device {
        if (!this.has(variable))
            throw Execution.error(this.#scope.position, 'Unknown variable', variable);

        (this.properties as Record<string, number>)[variable] = value

        if (this.properties.PrefabHash !== undefined)
            this.hash = this.properties.PrefabHash

		return this
	}

    getSlot(slot: number): Slot
    getSlot(slot: number, property: string): number

	getSlot(slot: number, property?: string): Slot | number {
        const s = this.slots[slot]

        if (s === undefined)
            throw Execution.error(this.#scope.position, 'Unknown Slot', slot)

        if (property === undefined)
            return s

        return s.get(property)
	}

    setSlot(slot: number, property: string, value: number): void
	setSlot(slot: number, property: string, value: number) {
        const s = this.slots[slot]

        if (s === undefined)
            throw Execution.error(this.#scope.position, 'Unknown Slot', slot)

        s.set(property, value)
    }
}