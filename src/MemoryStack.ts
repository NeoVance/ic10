import {RegisterCell} from "./RegisterCell";
import {Ic10Error} from "./Ic10Error";

export class MemoryStack extends RegisterCell {
    declare public value: number
    readonly #stack: number[]

	constructor(size: number, name: string) {
		super(name)
        this.#stack = Array(size).fill(0)
		this.value  = 0
	}

	push(value: number): MemoryStack {
		if (this.value >= 512) {
            throw new Ic10Error('Stack overflow by', value)
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
