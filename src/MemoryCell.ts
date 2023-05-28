import InterpreterIc10                  from "./main";
import {DeviceFields, DeviceProperties} from "./DeviceProperties";
import {Slot}                           from "./Slot";
import {Device}           from "./Device";

export class MemoryCell {
	public value: number = 0
	public name: string;
	public alias: string | number | null = null;
	private scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, name: string) {
		this.scope = scope;
		this.name   = name;
	}

	getName() {
		return this.alias || this.name;
	}
}