"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStack = void 0;
const main_1 = require("./main");
const RegisterCell_1 = require("./RegisterCell");
class MemoryStack extends RegisterCell_1.RegisterCell {
    #scope;
    #stack;
    constructor(scope, size, name) {
        super(name);
        this.#scope = scope;
        this.#stack = Array(size).fill(0);
        this.value = 0;
    }
    push(value) {
        if (this.value >= 512) {
            throw main_1.Execution.error(this.#scope.position, 'Stack Overflow !!!');
        }
        this.#stack[this.value] = value;
        this.value++;
        return this;
    }
    pop() {
        const o = this.#stack.slice(this.value - 1, this.value)[0] ?? 0;
        this.value--;
        if (this.value < 0) {
            this.value = 0;
        }
        return o;
    }
    peek() {
        return this.#stack.slice(this.value, this.value + 1)[0] ?? 0;
    }
    getStack() {
        return this.#stack;
    }
}
exports.MemoryStack = MemoryStack;
//# sourceMappingURL=MemoryStack.js.map