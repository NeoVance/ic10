"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStack = void 0;
const main_1 = require("./main");
const MemoryCell_1 = require("./MemoryCell");
class MemoryStack extends MemoryCell_1.MemoryCell {
    #scope;
    constructor(scope, name) {
        super(scope, name);
        this.#scope = scope;
        this.value = [];
        this.index = 0;
    }
    push(value) {
        if (this.value.length >= 512) {
            throw main_1.Execution.error(this.#scope.position, 'Stack Overflow !!!');
        }
        this.value[this.index] = this.#scope.memory.cell(value);
        this.index++;
        return this;
    }
    pop() {
        const o = this.value.slice(this.index - 1, this.index)[0] ?? 0;
        this.index--;
        if (this.index < 0) {
            this.index = 0;
        }
        return o;
    }
    peek() {
        return this.value.slice(this.index, this.index + 1)[0] ?? 0;
    }
    getStack() {
        return this.value;
    }
    get(variable = null) {
        return this.index;
    }
    set(variable, value) {
        this.index = value;
        return this;
    }
}
exports.MemoryStack = MemoryStack;
//# sourceMappingURL=MemoryStack.js.map