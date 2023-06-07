"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStackCommands = void 0;
const makeStackCommands = scope => {
    const push = (a) => {
        scope.memory.stack.push(scope.memory.getValue(a));
    };
    const pop = (register) => {
        scope.memory.getRegister(register).value = scope.memory.stack.pop();
    };
    const peek = (register) => {
        scope.memory.getRegister(register).value = scope.memory.stack.peek();
    };
    return { push, pop, peek };
};
exports.makeStackCommands = makeStackCommands;
//# sourceMappingURL=stack.js.map