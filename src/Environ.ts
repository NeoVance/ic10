import InterpreterIc10 from "./main";
import {Device}        from "./Device";
import {IcHousing}          from "./devices/IcHousing";

export class Environ {
	public d0: Device
	public d1: Device
	public d2: Device
	public d3: Device
	public d4: Device
	public d5: Device
	public db: IcHousing
	#scope: InterpreterIc10;

	constructor(scope: InterpreterIc10) {
		this.#scope = scope;
		this.d0     = new Device(scope, 'd0')
		this.d1     = new Device(scope, 'd1')
		this.d2     = new Device(scope, 'd2')
		this.d3     = new Device(scope, 'd3')
		this.d4     = new Device(scope, 'd4')
		this.d5     = new Device(scope, 'd5')
		this.db     = new IcHousing(scope, 'db')
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