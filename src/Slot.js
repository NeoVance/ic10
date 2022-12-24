"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const main_1 = require("./main");
class Slot {
    number;
    properties = {
        Charge: 0,
        ChargeRatio: 0,
        Class: 0,
        Damage: 0,
        Efficiency: 0,
        Growth: 0,
        Health: 0,
        Mature: 0,
        MaxQuantity: 0,
        OccupantHash: 0,
        Occupied: 0,
        PrefabHash: 0,
        Pressure: 0,
        PressureAir: 0,
        PressureWaste: 0,
        Quantity: 0,
        Temperature: 0
    };
    #scope;
    constructor(scope, number) {
        this.#scope = scope;
        this.number = number;
    }
    get scope() {
        return this.#scope;
    }
    get(op1) {
        if (op1 in this.properties) {
            return this.properties[op1];
        }
        else {
            throw main_1.Execution.error(this.#scope.position, 'Unknown parameter', op1);
        }
    }
    set(op1, value) {
        if (op1 in this.properties) {
            this.properties[op1] = value;
        }
        else {
            throw main_1.Execution.error(this.#scope.position, 'Unknown parameter', op1);
        }
    }
}
exports.Slot = Slot;
//# sourceMappingURL=Slot.js.map