import {Ic10Error} from "./Ic10Error";

export interface ItemProperties {
    Charge: number
    ChargeRatio: number
    Class: number
    Damage: number
    Efficiency: number
    Growth: number
    Health: number
    Mature: number
    MaxQuantity: number
    OccupantHash: number
    Occupied: number
    PrefabHash: number
    Pressure: number
    PressureAir: number
    PressureWaste: number
    Quantity: number
    Temperature: number
    LineNumber: number
}

export class Slot {
	number: number;
	public properties: Partial<ItemProperties>

	constructor(number: number, properties?: Partial<ItemProperties>) {
		this.number = number;
        this.properties = properties ?? {}
	}

    init(properties: Partial<ItemProperties>) {
        this.properties = properties
    }

    has(property: string) {
        return property in this.properties
    }

	get(property: string) {
		if (!this.has(property))
            throw new Ic10Error('Unknown parameter', property)

        return (this.properties as Record<string, number>)[property]
	}

	set(property: string, value: number) {
		if (!this.has(property))
            throw new Ic10Error('Unknown parameter', property);

        (this.properties as Record<string, number>)[property] = value
	}
}