import InterpreterIc10 from "./main";
import {Device}        from "./Device";

export class Chip extends Device {
	//-128473777
	#scope: InterpreterIc10

	constructor(scope: InterpreterIc10, name: string, number: number) {
		super(scope, name, number)
		this.hash                                        = -128473777
		this.#scope                                      = scope
		this.properties.slots[0].properties.OccupantHash = -744098481
	}
}
