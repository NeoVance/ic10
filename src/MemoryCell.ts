import InterpreterIc10                  from "./main";
import {DeviceFields, DeviceProperties} from "./DeviceProperties";
import {Slot}                           from "./Slot";
import {Device}           from "./Device";

export class MemoryCell {
	public value: any
	public name: string;
	public alias: string|number|null = null;
	#scope: InterpreterIc10;

	constructor(scope: InterpreterIc10, name: string) {
		this.#scope = scope;
		this.name   = name;
		this.alias  = null;
		this.value  = null
	}

	getName() {
		return this.alias || this.name;
	}

	get(variable: any = null): Device | number | DeviceProperties | Slot[] {
		return this.value
	}

	set(variable: any, value: any): MemoryCell {
		this.value = value
		return this;
	}
}