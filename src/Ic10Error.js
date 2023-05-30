"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ic10Error = void 0;
class Ic10Error extends Error {
    message;
    code;
    functionName;
    lvl;
    line;
    className;
    obj;
    constructor(caller, code, message, obj, lvl = 0) {
        super(message);
        this.message = message;
        this.code = code;
        this.obj = obj;
        this.lvl = lvl;
        this.className = caller?.typeName ?? '';
        this.functionName = caller?.functionName ?? caller?.methodName ?? '';
        this.line = caller?.lineNumber ?? 0;
    }
    getCode() {
        return this.code;
    }
    getMessage() {
        return this.message;
    }
}
exports.Ic10Error = Ic10Error;
//# sourceMappingURL=Ic10Error.js.map
