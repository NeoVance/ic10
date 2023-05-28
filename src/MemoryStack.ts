import InterpreterIc10, {Execution} from "./main";
import {MemoryCell}                 from "./MemoryCell";

export class MemoryStack extends MemoryCell {
    declare public value: number
	#scope: InterpreterIc10;
    readonly #stack: number[]

	constructor(scope: InterpreterIc10, size: number, name: string) {
		super(name)
		this.#scope = scope
        this.#stack = Array(size).fill(0)
		this.value  = 0
	}

	push(value: number): MemoryStack {
		if (this.value >= 512) {
			throw Execution.error(this.#scope.position, 'Stack Overflow !!!')
		}
		this.#stack[this.value] = value
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
}