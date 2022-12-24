import InterpreterIc10, {Execution} from "./main";

export class Slot {
	number: number;
	public properties: {
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
		[key: string]: number
	} = {
		Charge       : 0,
		ChargeRatio  : 0,
		Class        : 0,
		Damage       : 0,
		Efficiency   : 0,
		Growth       : 0,
		Health       : 0,
		Mature       : 0,
		MaxQuantity  : 0,
		OccupantHash : 0,
		Occupied     : 0,
		PrefabHash   : 0,
		Pressure     : 0,
		PressureAir  : 0,
		PressureWaste: 0,
		Quantity     : 0,
		Temperature  : 0
	}
	readonly #scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, number: number) {
		this.#scope = scope;
		this.number = number;
	}

	get scope(): InterpreterIc10 {
		return this.#scope;
	}

	get(op1: string) {
		if (op1 in this.properties) {
			return this.properties[op1]
		} else {
			throw Execution.error(this.#scope.position, 'Unknown parameter', op1)
		}
	}

	set(op1: string, value: any) {
		if (op1 in this.properties) {
			this.properties[op1] = value
		} else {
			throw Execution.error(this.#scope.position, 'Unknown parameter', op1)
		}
	}
}