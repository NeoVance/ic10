import InterpreterIc10, {Execution} from "./main";
import {MemoryCell}                 from "./MemoryCell";

export class ConstantCell extends MemoryCell {
	declare public value: any
	#scope: InterpreterIc10;

	constructor(value: any, scope: InterpreterIc10, name: string) {
		super(scope, name);
		this.#scope = scope;
		this.value  = value
	}

	get() {
		return this.value
	}

	set(value: any, _: any = null) {
		throw Execution.error(this.#scope.position, 'Can`t change constant')
		return this
	}
}