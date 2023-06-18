"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceFromConfig = exports.DebugDevice = exports.Device = exports.IcHash = void 0;
const Slot_1 = require("../Slot");
const Utils_1 = require("../Utils");
const DeviceOutput_1 = require("../DeviceOutput");
const icTypes_1 = require("../icTypes");
const Ic10Error_1 = require("../Ic10Error");
const reagents_1 = require("../data/reagents");
const lodash_1 = __importDefault(require("lodash"));
const devices_1 = __importDefault(require("../data/devices"));
exports.IcHash = (0, Utils_1.hashStr)("ItemIntegratedCircuit10");
class Device {
    nameHash;
    properties;
    propertiesAccess = {};
    slots;
    outputs = {};
    reagents = {
        Contents: {},
        Recipe: {},
        Required: {}
    };
    constructor(slotCount, fields) {
        this.properties = fields;
        this.slots = Array(slotCount ?? 0).fill(0).map((_, i) => new Slot_1.Slot(i));
    }
    has(variable) {
        return (variable in this.properties);
    }
    get(variable) {
        if (!this.has(variable))
            throw new Ic10Error_1.Ic10Error('Unknown variable', variable);
        return this.properties[variable];
    }
    set(variable, value) {
        if (!(0, icTypes_1.isDeviceParameter)(variable))
            throw new Ic10Error_1.Ic10Error('Unknown variable', variable);
        const r = this.properties;
        r[variable] = value;
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
    getReagent(reagentMode, reagent) {
        const rm = (0, reagents_1.getReagentMode)(reagentMode);
        if (rm === undefined)
            throw new Ic10Error_1.Ic10Error("Unknown reagent mode", reagentMode);
        const r = (0, reagents_1.getReagent)(reagent);
        if (r === undefined)
            throw new Ic10Error_1.Ic10Error("Unknown reagent", reagent);
        return this.reagents[rm][r] ?? 0;
    }
}
exports.Device = Device;
class DebugDevice extends Device {
    constructor(slotCount, fields, additionalOptions) {
        super(slotCount, { PrefabHash: fields.PrefabHash ?? 0, ...fields });
        const reagents = additionalOptions?.reagents ?? {};
        this.reagents = lodash_1.default.merge(this.reagents, reagents);
    }
}
exports.DebugDevice = DebugDevice;
const deviceFromConfig = (type) => {
    const d = devices_1.default.devices[type];
    const fields = lodash_1.default.pick(d, icTypes_1.valuesDeviceParameter);
    for (const prop in d.params) {
        if (fields[prop] !== undefined)
            continue;
        fields[prop] = 0;
    }
    return new Device(d.slot_count, fields);
};
exports.deviceFromConfig = deviceFromConfig;
//# sourceMappingURL=Device.js.map