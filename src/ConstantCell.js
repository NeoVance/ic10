"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantCell = void 0;
const ValueCell_1 = require("./ValueCell");
class ConstantCell extends ValueCell_1.ValueCell {
    constructor(value, name) {
        super(value, name);
    }
}
exports.ConstantCell = ConstantCell;
//# sourceMappingURL=ConstantCell.js.map