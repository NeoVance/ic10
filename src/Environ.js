"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environ = void 0;
const Device_1 = require("./Device");
const IcHousing_1 = require("./devices/IcHousing");
class Environ {
    d0;
    d1;
    d2;
    d3;
    d4;
    d5;
    db;
    #scope;
    constructor(scope) {
        this.#scope = scope;
        this.d0 = new Device_1.Device(scope, 'd0');
        this.d1 = new Device_1.Device(scope, 'd1');
        this.d2 = new Device_1.Device(scope, 'd2');
        this.d3 = new Device_1.Device(scope, 'd3');
        this.d4 = new Device_1.Device(scope, 'd4');
        this.d5 = new Device_1.Device(scope, 'd5');
        this.db = new IcHousing_1.IcHousing(scope, 'db');
    }
    get(cell) {
        switch (cell) {
            case 'd0':
                return this.d0;
            case 'd1':
                return this.d1;
            case 'd2':
                return this.d2;
            case 'd3':
                return this.d3;
            case 'd4':
                return this.d4;
            case 'd5':
                return this.d5;
            case 'db':
                return this.db;
        }
        throw '';
    }
}
exports.Environ = Environ;
//# sourceMappingURL=Environ.js.map