import InterpreterIc10                  from "./main";

export class MemoryCell {
	public value: number = 0
	public name: string;

	constructor(name: string) {
		this.name   = name;
	}
}