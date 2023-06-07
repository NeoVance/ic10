"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordErrorMsg = exports.Ic10DiagnosticError = exports.Ic10Error = void 0;
class Ic10Error extends Error {
    obj;
    lvl;
    line;
    constructor(message, obj, lvl = 0, info) {
        super((!(obj instanceof Object) && obj !== undefined) ? `${message}: ${obj}` : message, info !== undefined ? { cause: info.cause } : undefined);
        this.obj = obj;
        this.lvl = lvl;
        this.line = info?.line ?? 0;
    }
}
exports.Ic10Error = Ic10Error;
class Ic10DiagnosticError extends Ic10Error {
}
exports.Ic10DiagnosticError = Ic10DiagnosticError;
const keywordErrorMsg = (target) => `Expected ${target}, got keyword`;
exports.keywordErrorMsg = keywordErrorMsg;
//# sourceMappingURL=Ic10Error.js.map