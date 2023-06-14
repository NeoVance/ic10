"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeviceCommands = exports.BatchModes = void 0;
const Ic10Error_1 = require("../Ic10Error");
const icTypes_1 = require("../icTypes");
const types_1 = require("../types");
exports.BatchModes = {
    Average: 0,
    Sum: 1,
    Minimum: 2,
    Maximum: 3
};
const makeDeviceCommands = (scope) => {
    function __transformBatch(values, mode) {
        const modeMapping = exports.BatchModes;
        const m = modeMapping[mode] ?? scope.memory.getValue(mode);
        switch (m) {
            case exports.BatchModes.Average:
                return values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length;
            case exports.BatchModes.Sum:
                return values.reduce((partial_sum, a) => partial_sum + a, 0);
            case exports.BatchModes.Minimum:
                return Math.min(...values);
            case exports.BatchModes.Maximum:
                return Math.max(...values);
        }
        throw new Ic10Error_1.Ic10Error("Unknown batch mode", mode);
    }
    function __getDevices(hash, name) {
        const devices = [];
        for (let i = 0; i <= 5; i++) {
            const d = scope.memory.findDevice('d' + i);
            if (d === undefined)
                continue;
            if (d.get("PrefabHash") == hash && (name === undefined || d.nameHash === name))
                devices.push(d);
        }
        return devices;
    }
    const l = (register, device, property) => {
        const r = scope.memory.getRegister(register);
        const a = scope.memory.getDeviceOrDeviceOutput(device);
        if ((0, types_1.isDevice)(a)) {
            if (!(0, icTypes_1.isDeviceParameter)(property))
                throw new Ic10Error_1.Ic10DiagnosticError(`Wrong third argument, expected device parameter`, property);
        }
        else {
            if (!(0, icTypes_1.isChannel)(property))
                throw new Ic10Error_1.Ic10DiagnosticError(`Wrong third argument, expected channel`, property);
        }
        r.value = a.get(property);
    };
    const ls = (register, device, slot, property) => {
        const r = scope.memory.getRegister(register);
        const d = scope.memory.getDevice(device);
        r.value = d.getSlot(scope.memory.getValue(slot), property);
    };
    const s = (device, property, value) => {
        const a = scope.memory.getDeviceOrDeviceOutput(device);
        if ((0, types_1.isDevice)(a)) {
            if (!(0, icTypes_1.isDeviceParameter)(property)) {
                throw new Ic10Error_1.Ic10DiagnosticError(`Wrong second argument (${property}). Must be "Device parameter"`, property);
            }
        }
        else {
            if (!(0, icTypes_1.isChannel)(property)) {
                throw new Ic10Error_1.Ic10DiagnosticError(`Wrong second argument (${property}). Must be "Channel"`, property);
            }
        }
        a.set(property, scope.memory.getValue(value));
    };
    const lb = (register, deviceHash, property, mode) => {
        const hash = scope.memory.getValue(deviceHash);
        const devices = __getDevices(hash);
        if (devices.length === 0)
            throw new Ic10Error_1.Ic10DiagnosticError('Can`t find device with hash', hash);
        const values = devices.map(d => d.get(property));
        scope.memory.getRegister(register).value = __transformBatch(values, mode);
    };
    const lr = (register, device, mode, property) => {
        throw new Ic10Error_1.Ic10DiagnosticError("lr not implemented yet");
    };
    const sb = (deviceHash, property, value) => {
        const hash = scope.memory.getValue(deviceHash);
        const v = scope.memory.getValue(value);
        const devices = __getDevices(hash);
        devices.forEach(d => d.set(property, v));
    };
    const lbn = (targetRegister, deviceHash, nameHash, property, batchMode) => {
        const hash = scope.memory.getValue(deviceHash);
        const name = scope.memory.getValue(nameHash);
        const devices = __getDevices(hash, name);
        const values = devices.map(d => d.get(property));
        if (values.length === 0)
            throw new Ic10Error_1.Ic10Error("Can't find device with hash", hash);
        scope.memory.getRegister(targetRegister).value = __transformBatch(values, batchMode);
    };
    const sbn = (deviceHash, nameHash, property, value) => {
        const hash = scope.memory.getValue(deviceHash);
        const v = scope.memory.getValue(value);
        const name = scope.memory.getValue(nameHash);
        const devices = __getDevices(hash, name);
        devices.forEach(d => d.set(property, v));
    };
    const lbs = (register, deviceHash, slotIndex, property, batchMode) => {
        const hash = scope.memory.getValue(deviceHash);
        const slot = scope.memory.getValue(slotIndex);
        const devices = __getDevices(hash);
        const values = devices.map(d => d.getSlot(slot, property));
        scope.memory.getRegister(register).value = __transformBatch(values, batchMode);
    };
    const lbns = (register, deviceHash, nameHash, slotIndex, property, batchMode) => {
        const hash = scope.memory.getValue(deviceHash);
        const name = scope.memory.getValue(nameHash);
        const slot = scope.memory.getValue(slotIndex);
        const devices = __getDevices(hash, name);
        const values = devices.map(d => d.getSlot(slot, property));
        scope.memory.getRegister(register).value = __transformBatch(values, batchMode);
    };
    const ss = (device, slotIndex, property, value) => {
        const d = scope.memory.getDevice(device);
        const v = scope.memory.getValue(value);
        const slot = scope.memory.getValue(slotIndex);
        d.getSlot(slot).set(property, v);
    };
    const sbs = (deviceHash, slotIndex, property, value) => {
        const hash = scope.memory.getValue(deviceHash);
        const v = scope.memory.getValue(value);
        const slot = scope.memory.getValue(slotIndex);
        const devices = __getDevices(hash);
        devices.map(d => d.getSlot(slot).set(property, v));
    };
    return {
        l, ls, s, lb, lr, sb, lbn, sbn, lbs, lbns, ss, sbs
    };
};
exports.makeDeviceCommands = makeDeviceCommands;
//# sourceMappingURL=devices.js.map