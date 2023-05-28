import {DeviceFields} from "./DeviceProperties";
import InterpreterIc10, {Execution}     from "./main";
import {Slot}                       from "./Slot";

export class Device {
	public number: number;
	public hash: number;
    public name: string;
	public properties: Partial<DeviceFields>
    public slots: Slot[]
	readonly #scope: InterpreterIc10

	constructor(scope: InterpreterIc10, name: string, number: number, slotCount?: number, fields?: DeviceFields) {
        this.name = name
		this.#scope     = scope;
		this.hash       = 100000000
		this.#scope     = scope
		this.number     = number
		this.properties = fields ?? {}
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot(scope, i))
	}

	get scope(): InterpreterIc10 {
		return this.#scope;
	}

	get(variable: string): number  {
		if (variable == 'hash') {
			return this.hash
		}

		if (!(variable in this.properties))
            throw Execution.error(this.#scope.position, 'Unknown variable', variable)

        return (this.properties as Record<string, number>)[variable]
	}

	set(variable: string, value: number): Device {
        if (!(variable in this.properties))
            throw Execution.error(this.#scope.position, 'Unknown variable', variable);

        (this.properties as Record<string, number>)[variable] = value

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