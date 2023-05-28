"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantCell = void 0;
const MemoryCell_1 = require("./MemoryCell");
class ConstantCell extends MemoryCell_1.MemoryCell {
    constructor(value, scope, name) {
        super(scope, name);
        this.value = value;
    }
}
exports.ConstantCell = ConstantCell;
//# sourceMappingURL=ConstantCell.js.map