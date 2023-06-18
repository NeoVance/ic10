import {Device} from "./devices/Device";
import {IcHousing} from "./devices/IcHousing";
import {Slot} from "./Slot";
import {DeviceOutput} from "./DeviceOutput";
import {TypeDeviceParameter} from "./icTypes";

export type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
export type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type accessType = 'read|write' | 'read' | 'write'

export type DeviceDataType = {    assoc: { [P: string | `${number}`]: string | number },
	devices: {
		[P: string]: {
			PrefabHash: number
			params: { [key in TypeDeviceParameter|string]: accessType }
			name: string
			description: string
			slot_count: number
		}
	},
}

export function isDevice(val: any): val is Device {
    if (typeof val === 'object') {
        if (val instanceof Device || val.constructor.name === 'Device' || val.constructor.name === 'DebugDevice') {
            return true
        }
    }
    return false
}
export function isIcHousing(val: any): val is IcHousing {
	if (typeof val === 'object') {
		if (val.constructor.name === 'IcHousing') {
			return true
		}
	}
	return false
}
export function isSlot(val: any): val is Slot {
	if (typeof val === 'object') {
		if (val.constructor.name === 'Slot') {
			return true
		}
	}
	return false
}
export function isDeviceOutput(val: any): val is DeviceOutput {
	if (typeof val === 'object') {
		if (val.constructor.name === 'DeviceOutput') {
			return true
		}
	}
	return false
}

export const reverseMapping = <Key extends string | number, Value extends string | number>(mapping: Record<Key, Value>): Record<Value, Key> => {
    const keys: Key[] = Object.keys(mapping) as Key[]
    return keys.reduce((acc, k) => {
        acc[mapping[k]] = k
        return acc
    }, {} as Record<Value, Key>)
}

export const arrToObj = <Value, Key extends string, NewValue>(arr: readonly Value[], transformer: (v: Value) => [Key, NewValue]): Record<Key, NewValue> => {
    return arr.reduce((acc, v) => {
        const [ k, nv ] = transformer(v)
        acc[k] = nv
        return acc
    }, {} as Record<Key, NewValue>)
}
