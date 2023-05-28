"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const main_1 = require("./main");
class Slot {
    number;
    properties;
    #scope;
    constructor(scope, number, properties) {
        this.#scope = scope;
        this.number = number;
        this.properties = properties ?? {};
    }
    init(properties) {
        this.properties = properties;
    }
    get scope() {
        return this.#scope;
    }
    has(property) {
        return property in this.properties;
    }
    get(property) {
        if (this.has(property)) {
            return this.properties[property];
        }
        else {
            throw main_1.Execution.error(this.#scope.position, 'Unknown parameter', property);
        }
    }
    set(property, value) {
        if (this.has(property)) {
            this.properties[property] = value;
        }
        else {
            throw main_1.Execution.error(this.#scope.position, 'Unknown parameter', property);
        }
    }
}
exports.Slot = Slot;
//# sourceMappingURL=Slot.js.map