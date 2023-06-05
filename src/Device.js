"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugDevice = exports.Device = exports.IcHash = void 0;
const Slot_1 = require("./Slot");
const Utils_1 = require("./Utils");
const DeviceOutput_1 = require("./DeviceOutput");
const icTypes_1 = require("./icTypes");
const Ic10Error_1 = require("./Ic10Error");
exports.IcHash = (0, Utils_1.hashStr)("ItemIntegratedCircuit10");
class Device {
    hash;
    nameHash;
    properties;
    slots;
    outputs = {};
    constructor(slotCount, fields) {
        this.hash = 0;
        this.properties = fields;
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot_1.Slot(i));
        if (this.properties.PrefabHash !== undefined)
            this.hash = this.properties.PrefabHash;
    }
    has(variable) {
        return (variable in this.properties);
    }
    get(variable) {
        if (variable == 'hash')
            return this.hash;
        if (!this.has(variable))
            throw new Ic10Error_1.Ic10Error('Unknown variable', variable);
        return this.properties[variable];
    }
    set(variable, value) {
        if (!(0, icTypes_1.isDeviceParameter)(variable))
            throw new Ic10Error_1.Ic10Error('Unknown variable', variable);
        const r = this.properties;
        r[variable] = value;
        if (r.PrefabHash !== undefined)
            this.hash = r.PrefabHash;
        return this;
    }
    getSlot(slot, property) {
        const s = this.slots[slot];
        if (s === undefined)
            throw new Ic10Error_1.Ic10Error('Unknown slot', slot);
        if (property === undefined)
            return s;
        return s.get(property);
    }
    setSlot(slot, property, value) {
        const s = this.slots[slot];
        if (s === undefined)
            throw new Ic10Error_1.Ic10Error('Unknown slot', slot);
        s.set(property, value);
    }
    getChannel(channel) {
        const ch = String(channel);
        const o = this.outputs[ch];
        if (o === undefined)
            this.outputs[ch] = new DeviceOutput_1.DeviceOutput(this);
        return this.outputs[ch];
    }
}
exports.Device = Device;
class DebugDevice extends Device {
    constructor(slotCount, fields) {
        super(slotCount, fields);
    }
}
exports.DebugDevice = DebugDevice;
//# sourceMappingURL=Device.js.map