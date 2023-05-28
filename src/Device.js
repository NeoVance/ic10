"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = exports.IcHash = void 0;
const main_1 = require("./main");
const Slot_1 = require("./Slot");
const Utils_1 = require("./Utils");
exports.IcHash = (0, Utils_1.hashStr)("ItemIntegratedCircuit10");
class Device {
    hash;
    name;
    properties;
    slots;
    #scope;
    constructor(scope, name, slotCount, fields) {
        this.name = name;
        this.#scope = scope;
        this.hash = 0;
        this.#scope = scope;
        this.properties = fields ?? {};
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot_1.Slot(scope, i));
        if (this.properties.PrefabHash !== undefined)
            this.hash = this.properties.PrefabHash;
    }
    get scope() {
        return this.#scope;
    }
    init(properties) {
        this.properties = properties;
    }
    has(variable) {
        return (variable in this.properties);
    }
    get(variable) {
        if (variable == 'hash') {
            return this.hash;
        }
        if (!this.has(variable))
            throw main_1.Execution.error(this.#scope.position, 'Unknown variable', variable);
        return this.properties[variable];
    }
    set(variable, value) {
        if (!this.has(variable))
            throw main_1.Execution.error(this.#scope.position, 'Unknown variable', variable);
        this.properties[variable] = value;
        if (this.properties.PrefabHash !== undefined)
            this.hash = this.properties.PrefabHash;
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