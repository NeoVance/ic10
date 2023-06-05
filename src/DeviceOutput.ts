import InterpreterIc10 from "./main";
import {Device} from "./Device";
import {isChannel} from "./icTypes";
import {Ic10Error} from "./Ic10Error";

export class DeviceOutput {
    constructor(public device: Device) {}

    public Channel0: number = 0;
    public Channel1: number = 0;
    public Channel2: number = 0;
    public Channel3: number = 0;
    public Channel4: number = 0;
    public Channel5: number = 0;
    public Channel6: number = 0;
    public Channel7: number = 0;
    public Channel8: number = 0;

    get(property: string): number {
        if (!isChannel(property))
            throw new Ic10Error('Invalid channel', property)

        return <number>this[property];
    }

    set(property: string, value: number): DeviceOutput {
        if (!isChannel(property))
            throw new Ic10Error('Invalid channel', property)

        this[property] = value;
        return this
    }

    isEmpty() {
        const arr = this.toArray()
        let sum = 0;
        arr.forEach(x => {
            sum += x;
        });
        return sum === 0
    }

    toArray(): number[] {
        const arr = new Array(8)
        arr[0] = this.Channel0
        arr[1] = this.Channel1
        arr[2] = this.Channel2
        arr[3] = this.Channel3
        arr[4] = this.Channel4
        arr[5] = this.Channel5
        arr[6] = this.Channel6
        arr[7] = this.Channel7
        arr[8] = this.Channel8
        return arr
    }
}
