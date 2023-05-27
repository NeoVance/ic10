import InterpreterIc10, {Execution} from "./main";
import {MemoryCell}                 from "./MemoryCell";
import {Device}                     from "./Device";
import {DeviceProperties}           from "./DeviceProperties";
import {Slot}                       from "./Slot";

export class MemoryStack extends MemoryCell {
    declare value: number
	#scope: InterpreterIc10;
    readonly #stack: number[]

	constructor(scope: InterpreterIc10, size: number, name: string) {
		super(scope, name)
		this.#scope = scope
        this.#stack = Array(size).fill(0)
		this.value  = 0
	}

	push(value: number): MemoryStack {
		if (this.value >= 512) {
			throw Execution.error(this.#scope.position, 'Stack Overflow !!!')
		}
		this.#stack[this.value] = this.#scope.memory.cell(value)
		this.value++
		return this
	}

	pop(): number {
		const o = this.#stack.slice(this.value - 1, this.value)[0] ?? 0;
		this.value--
		if (this.value < 0) {
			this.value = 0
		}
		return o
	}

	peek(): number {
		return this.#stack.slice(this.value, this.value + 1)[0] ?? 0
	}

	getStack() {
		return this.#stack
	}

	get(variable: any = null): Device | number | DeviceProperties | Slot[] {
		return this.value
	}

	set(variable: any, value: number) {
		this.value = value
		return this
	}
}