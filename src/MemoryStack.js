"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStack = void 0;
const RegisterCell_1 = require("./RegisterCell");
const Ic10Error_1 = require("./Ic10Error");
class MemoryStack extends RegisterCell_1.RegisterCell {
    #stack;
    constructor(size, name) {
        super(name);
        this.#stack = Array(size).fill(0);
        this.value = 0;
    }
    push(value) {
        if (this.value >= 512) {
            throw new Ic10Error_1.Ic10Error('Stack overflow by', value);
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