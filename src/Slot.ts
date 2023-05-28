import InterpreterIc10, {Execution} from "./main";

export interface ItemProperties {
    Charge: number
    ChargeRatio: number
    Class: number
    Damage: number
    Efficiency: number
    Growth: number
    Health: number
    Mature: number
    MaxQuantity: number
    OccupantHash: number
    Occupied: number
    PrefabHash: number
    Pressure: number
    PressureAir: number
    PressureWaste: number
    Quantity: number
    Temperature: number
    LineNumber: number
}

export class Slot {
	number: number;
	public properties: Partial<ItemProperties>
	readonly #scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, number: number, properties?: Partial<ItemProperties>) {
		this.#scope = scope;
		this.number = number;
        this.properties = properties ?? {}
	}

    init(properties: Partial<ItemProperties>) {
        this.properties = properties
    }

	get scope(): InterpreterIc10 {
		return this.#scope;
	}

    has(property: string) {
        return property in this.properties
    }

	get(property: string) {
		if (this.has(property)) {
			return (this.properties as Record<string, number>)[property]
		} else {
			throw Execution.error(this.#scope.position, 'Unknown parameter', property)
		}
	}

	set(property: string, value: number) {
		if (this.has(property)) {
            (this.properties as Record<string, number>)[property] = value
		} else {
			throw Execution.error(this.#scope.position, 'Unknown parameter', property)
		}
	}
}