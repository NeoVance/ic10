"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceOutput = void 0;
const icTypes_1 = require("./icTypes");
const Ic10Error_1 = require("./Ic10Error");
class DeviceOutput {
    device;
    constructor(device) {
        this.device = device;
    }
    Channel0 = 0;
    Channel1 = 0;
    Channel2 = 0;
    Channel3 = 0;
    Channel4 = 0;
    Channel5 = 0;
    Channel6 = 0;
    Channel7 = 0;
    Channel8 = 0;
    get(property) {
        if (!(0, icTypes_1.isChannel)(property))
            throw new Ic10Error_1.Ic10Error('Invalid channel', property);
        return this[property];
    }
    set(property, value) {
        if (!(0, icTypes_1.isChannel)(property))
            throw new Ic10Error_1.Ic10Error('Invalid channel', property);
        this[property] = value;
        return this;
    }
    isEmpty() {
        const arr = this.toArray();
        let sum = 0;
        arr.forEach(x => {
            sum += x;
        });
        return sum === 0;
    }
    toArray() {
        const arr = new Array(8);
        arr[0] = this.Channel0;
        arr[1] = this.Channel1;
        arr[2] = this.Channel2;
        arr[3] = this.Channel3;
        arr[4] = this.Channel4;
        arr[5] = this.Channel5;
        arr[6] = this.Channel6;
        arr[7] = this.Channel7;
        arr[8] = this.Channel8;
        return arr;
    }
}
exports.DeviceOutput = DeviceOutput;
//# sourceMappingURL=DeviceOutput.js.map