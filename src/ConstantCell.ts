import InterpreterIc10, {Execution} from "./main";
import {MemoryCell}                 from "./MemoryCell";

export class ConstantCell extends MemoryCell {
	declare public readonly value: number

	constructor(value: number, name: string) {
		super(name);
		this.value  = value
	}
}