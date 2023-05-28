"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCell = void 0;
class MemoryCell {
    value = 0;
    name;
    alias = null;
    scope;
    constructor(scope, name) {
        this.scope = scope;
        this.name = name;
    }
    getName() {
        return this.alias || this.name;
    }
}
exports.MemoryCell = MemoryCell;
//# sourceMappingURL=MemoryCell.js.map