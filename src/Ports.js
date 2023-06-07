"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ports = void 0;
const IcHousing_1 = require("./devices/IcHousing");
const Ic10Error_1 = require("./Ic10Error");
class Ports {
    d0;
    d1;
    d2;
    d3;
    d4;
    d5;
    db;
    constructor() {
        this.db = new IcHousing_1.IcHousing();
    }
    get(d) {
        switch (d) {
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
        throw new Ic10Error_1.Ic10Error("Unknown device", d);
    }
    set(d, device) {
        switch (d) {
            case 'd0':
                return this.d0 = device;
            case 'd1':
                return this.d1 = device;
            case 'd2':
                return this.d2 = device;
            case 'd3':
                return this.d3 = device;
            case 'd4':
                return this.d4 = device;
            case 'd5':
                return this.d5 = device;
            case 'db':
                return this.db = device;
        }
        throw new Ic10Error_1.Ic10Error("Device not found", d);
    }
}
exports.Ports = Ports;
//# sourceMappingURL=Ports.js.map