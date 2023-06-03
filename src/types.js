"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeviceOutput = exports.isSlot = exports.isIcHousing = exports.isDevice = void 0;
function isDevice(val) {
    if (typeof val === 'object') {
        if (val.constructor.name === 'Device') {
            return true;
        }
    }
    return false;
}
exports.isDevice = isDevice;
function isIcHousing(val) {
    if (typeof val === 'object') {
        if (val.constructor.name === 'IcHousing') {
            return true;
        }
    }
    return false;
}
exports.isIcHousing = isIcHousing;
function isSlot(val) {
    if (typeof val === 'object') {
        if (val.constructor.name === 'Slot') {
            return true;
        }
    }
    return false;
}
exports.isSlot = isSlot;
function isDeviceOutput(val) {
    if (typeof val === 'object') {
        if (val.constructor.name === 'DeviceOutput') {
            return true;
        }
    }
    return false;
}
exports.isDeviceOutput = isDeviceOutput;
//# sourceMappingURL=types.js.map