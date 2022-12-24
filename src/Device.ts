import {MemoryCell}                     from "./MemoryCell";
import {DeviceFields, DeviceProperties} from "./DeviceProperties";
import InterpreterIc10, {Execution}     from "./main";
import {Slot}                       from "./Slot";

export class Device extends MemoryCell {
	public number: number;
	public hash: number;
	public properties: DeviceProperties
	#scope: InterpreterIc10

	constructor(scope: InterpreterIc10, name: string, number: number) {
		super(scope, name);
		this.#scope     = scope;
		this.hash       = 100000000
		this.#scope     = scope
		this.number     = number
		this.properties = new DeviceProperties(scope)
	}

	get scope(): InterpreterIc10 {
		return this.#scope;
	}

	get(variable: any): Device | number | DeviceProperties | Slot[]  {
		if (!variable) {
			return this
		}
		if (variable == 'hash') {
			return this.hash
		}
		if (variable in this.properties) {
			return this.properties.get(variable)
		} else {
			throw Execution.error(this.#scope.position, 'Unknown variable', variable)
		}
	}

	set(variable: any, value: any):MemoryCell {
		if (variable in this.properties) {
			this.properties.set(variable, value)
		} else {
			throw Execution.error(this.#scope.position, 'Unknown variable', variable)
		}
		return this as MemoryCell
	}

	getSlot(op1: string, op2 = null) {
		if (op1 in this.properties.slots) {
			const index = parseInt(op1);
			if (op2) {
				return this.properties.slots[index]?.get(op2)
			} else {
				return this.properties.slots[index]
			}
		} else {
			throw Execution.error(this.#scope.position, 'Unknown Slot', op1)
		}
	}

	setSlot(op1: string, op2: any, value: any) {
		if (op1 in this.properties.slots) {
			const index = parseInt(op1);
			if (op2) {
				return this.properties.slots[index].set(op2, value)
			} else {
				throw Execution.error(this.#scope.position, 'Unknown Slot', op1)
			}
		}
	}
}