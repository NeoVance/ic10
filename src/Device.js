"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const main_1 = require("./main");
const Slot_1 = require("./Slot");
class Device {
    number;
    hash;
    name;
    properties;
    slots;
    #scope;
    constructor(scope, name, number, slotCount, fields) {
        this.name = name;
        this.#scope = scope;
        this.hash = 100000000;
        this.#scope = scope;
        this.number = number;
        this.properties = fields ?? {};
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot_1.Slot(scope, i));
    }
    get scope() {
        return this.#scope;
    }
    get(variable) {
        if (variable == 'hash') {
            return this.hash;
        }
        if (!(variable in this.properties))
            throw main_1.Execution.error(this.#scope.position, 'Unknown variable', variable);
        return this.properties[variable];
    }
    set(variable, value) {
        if (!(variable in this.properties))
            throw main_1.Execution.error(this.#scope.position, 'Unknown variable', variable);
        this.properties[variable] = value;
        return this;
    }
    getSlot(slot, property) {
        const s = this.slots[slot];
        if (s === undefined)
            throw main_1.Execution.error(this.#scope.position, 'Unknown Slot', slot);
        if (property === undefined)
            return s;
        return s.get(property);
    }
    setSlot(slot, property, value) {
        const s = this.slots[slot];
        if (s === undefined)
            throw main_1.Execution.error(this.#scope.position, 'Unknown Slot', slot);
        s.set(property, value);
    }
}
exports.Device = Device;
//# sourceMappingURL=Device.js.map