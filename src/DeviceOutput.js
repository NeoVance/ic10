"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceOutput = void 0;
const main_1 = require("./main");
const icTypes_1 = require("./icTypes");
class DeviceOutput {
    device;
    #scope;
    constructor(device, scope) {
        this.device = device;
        this.#scope = scope;
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
        if (!(0, icTypes_1.isChannel)(property)) {
            throw main_1.Execution.error(this.#scope.position, 'Unknown device', name);
        }
        return this[property];
    }
    set(property, value) {
        if (!(0, icTypes_1.isChannel)(property)) {
            throw main_1.Execution.error(this.#scope.position, 'Unknown device', name);
        }
        this[property] = value;
        return this;
    }
}
exports.DeviceOutput = DeviceOutput;
//# sourceMappingURL=DeviceOutput.js.map