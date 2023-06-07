"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConditions = void 0;
const makeConditions = (scope) => {
    const eq = (a, b = 0) => a == b;
    const ge = (a, b = 0) => a >= b;
    const gt = (a, b = 0) => a > b;
    const le = (a, b = 0) => a <= b;
    const lt = (a, b = 0) => a < b;
    const ne = (a, b = 0) => a != b;
    const ap = (x, y, c = 0) => !na(x, y, c);
    const na = (x, y, c = 0) => Math.abs(x - y) > c * Math.max(Math.abs(x), Math.abs(y));
    const dse = (d) => scope.memory.findDevice(d) !== undefined;
    const dns = (d) => !dse(d);
    const nan = (v) => isNaN(scope.memory.getValue(v));
    const nanz = (v) => !nan(v);
    return { eq, ge, gt, le, lt, ne, ap, na, dse, dns, nan, nanz };
};
exports.makeConditions = makeConditions;
//# sourceMappingURL=conditions.js.map