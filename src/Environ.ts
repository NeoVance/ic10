import InterpreterIc10 from "./main";
import {Device}        from "./Device";
import {Chip}          from "./Chip";

export class Environ {
	public d0: Device
	public d1: Device
	public d2: Device
	public d3: Device
	public d4: Device
	public d5: Device
	public db: Chip
	#scope: InterpreterIc10;

	constructor(scope: InterpreterIc10) {
		this.#scope = scope;
		this.d0     = new Device(scope, 'd0', 1)
		this.d1     = new Device(scope, 'd1', 2)
		this.d2     = new Device(scope, 'd2', 3)
		this.d3     = new Device(scope, 'd3', 4)
		this.d4     = new Device(scope, 'd4', 5)
		this.d5     = new Device(scope, 'd5', 6)
		this.db     = new Chip(scope, 'db', 7)
	}

	randomize() {
		for (const x in this) {
			let d = this[x]
			if (d instanceof Device) {
				d.properties.randomize()
			}
		}
	}

	get(cell: string): Device  {
		switch (cell) {
			case 'd0':
				return this.d0
			case 'd1':
				return this.d1
			case 'd2':
				return this.d2
			case 'd3':
				return this.d3
			case 'd4':
				return this.d4
			case 'd5':
				return this.d5
			case 'db':
				return this.db
		}
		throw ''
	}
}