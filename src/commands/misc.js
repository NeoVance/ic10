"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMiscCommands = void 0;
const makeMiscCommands = scope => {
    const _yield = () => { };
    const sleep = (s) => scope.sleeping = Math.ceil(scope.memory.getValue(s) / scope.settings.tickTime);
    const hcf = () => console.log("Die mother fucker, die!!!!!");
    return { yield: _yield, sleep, hcf };
};
exports.makeMiscCommands = makeMiscCommands;
//# sourceMappingURL=misc.js.map