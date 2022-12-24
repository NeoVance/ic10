"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ic10Error = void 0;
class ic10Error {
    message;
    code;
    functionName;
    lvl;
    line;
    className;
    obj;
    constructor(caller, code, message, obj, lvl = 0) {
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
exports.ic10Error = ic10Error;
//# sourceMappingURL=ic10Error.js.map