"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCell = void 0;
class MemoryCell {
    value;
    name;
    alias = null;
    #scope;
    constructor(scope, name) {
        this.#scope = scope;
        this.name = name;
        this.alias = null;
        this.value = null;
    }
    getName() {
        return this.alias || this.name;
    }
    get(variable = null) {
        return this.value;
    }
    set(variable, value) {
        this.value = value;
        return this;
    }
}
exports.MemoryCell = MemoryCell;
//# sourceMappingURL=MemoryCell.js.map