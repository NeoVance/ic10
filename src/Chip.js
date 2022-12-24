"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chip = void 0;
const Device_1 = require("./Device");
class Chip extends Device_1.Device {
    #scope;
    constructor(scope, name, number) {
        super(scope, name, number);
        this.hash = -128473777;
        this.#scope = scope;
        this.properties.slots[0].properties.OccupantHash = -744098481;
    }
}
exports.Chip = Chip;
//# sourceMappingURL=Chip.js.map