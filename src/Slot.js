"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const Ic10Error_1 = require("./Ic10Error");
class Slot {
    number;
    properties;
    constructor(number, properties) {
        this.number = number;
        this.properties = properties ?? {};
    }
    init(properties) {
        this.properties = properties;
    }
    has(property) {
        return property in this.properties;
    }
    get(property) {
        if (!this.has(property))
            throw new Ic10Error_1.Ic10Error('Unknown parameter', property);
        return this.properties[property];
    }
    set(property, value) {
        if (!this.has(property))
            throw new Ic10Error_1.Ic10Error('Unknown parameter', property);
        this.properties[property] = value;
    }
}
exports.Slot = Slot;
//# sourceMappingURL=Slot.js.map