import InterpreterIc10                  from "./main";

export class MemoryCell {
	public value: number = 0
	public name: string;
	private scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, name: string) {
		this.scope = scope;
		this.name   = name;
	}
}