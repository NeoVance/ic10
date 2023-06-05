import InterpreterIc10 from "./main";
import {Device} from "./Device";
import {IcHousing} from "./devices/IcHousing";
import {DeviceFieldsType} from "./DeviceProperties";
import {Ic10Error} from "./Ic10Error";

export class Ports {
	public d0?: Device
	public d1?: Device
	public d2?: Device
	public d3?: Device
	public d4?: Device
	public d5?: Device
	public db: Device<"Error">

	constructor() {
		this.db = new IcHousing()
	}

    get(d: "db"): Device
    get(d: string): Device | undefined
	get(d: string): Device | undefined  {
		switch (d) {
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
		throw new Ic10Error("Unknown device", d)
	}

    set(d: string, device: Device) {
        switch (d) {
            case 'd0':
                return this.d0 = device
            case 'd1':
                return this.d1 = device
            case 'd2':
                return this.d2 = device
            case 'd3':
                return this.d3 = device
            case 'd4':
                return this.d4 = device
            case 'd5':
                return this.d5 = device
            case 'db':
                return this.db = device
        }
        throw new Ic10Error("Device not found", d)
    }
}
