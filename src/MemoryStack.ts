import InterpreterIc10, {Execution} from "./main";
import {MemoryCell}                 from "./MemoryCell";
import {Device}                     from "./Device";
import {DeviceProperties}           from "./DeviceProperties";
import {Slot}                       from "./Slot";

export class MemoryStack extends MemoryCell {
	declare public value: number[]
	declare public index: number
	#scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, name: string) {
		super(scope, name)
		this.#scope = scope
		this.value  = []
		this.index  = 0
	}

	push(value: number): MemoryStack {
		if (this.value.length >= 512) {
			throw Execution.error(this.#scope.position, 'Stack Overflow !!!')
		}
		this.value[this.index] = this.#scope.memory.cell(value)
		this.index++
		return this
	}

	pop(): number {
		const o = this.value.slice(this.index - 1, this.index)[0] ?? 0;
		this.index--
		if (this.index < 0) {
			this.index = 0
		}
		return o
	}

	peek(): number {
		return this.value.slice(this.index, this.index + 1)[0] ?? 0
	}

	getStack() {
		return this.value
	}

	get(variable: any = null): Device | number | DeviceProperties | Slot[] {
		return this.index
	}

	set(variable: any, value: any) {
		this.index = value
		return this
	}
}