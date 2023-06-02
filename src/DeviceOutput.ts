import InterpreterIc10, {Execution} from "./main";
import {Device} from "./Device";
import {isChannel} from "./icTypes";

export class DeviceOutput {
    #scope: InterpreterIc10

    constructor(public device: Device, scope: InterpreterIc10) {
        this.#scope = scope
    }

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
        if (!isChannel(property)) {
            throw Execution.error(this.#scope.position, 'Unknown device', name)
        }
        return <number>this[property];
    }

    set(property: string, value: number): DeviceOutput {
        if (!isChannel(property)) {
            throw Execution.error(this.#scope.position, 'Unknown device', name)
        }
        this[property] = value;
        return this
    }
}
