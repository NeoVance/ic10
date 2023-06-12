"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDebugCommands = void 0;
const Ic10Error_1 = require("../Ic10Error");
const makeDebugCommands = scope => {
    function log(...args) {
        const out = [];
        try {
            for (const key of args) {
                try {
                    const value = scope.memory.findValue(key);
                    if (value !== undefined) {
                        out.push(`${key} = ${value};`);
                        continue;
                    }
                }
                catch {
                }
                let keys = key.split('.');
                try {
                    const device = scope.memory.findDevice(keys[0]);
                    if (device !== undefined) {
                        switch (keys.length) {
                            case 1: {
                                out.push(`${key} = ${JSON.stringify(device.properties)};`);
                                break;
                            }
                            case 2: {
                                const property = keys[1];
                                out.push(`${key} = ${device.get(property)};`);
                                break;
                            }
                            case 3: {
                                const slot = scope.memory.getValue(keys[2]);
                                out.push(`${key} = ${JSON.stringify(device.getSlot(slot))};`);
                                break;
                            }
                            case 4: {
                                const slot = scope.memory.getValue(keys[2]);
                                const property = keys[3];
                                out.push(`${key} = ${device.getSlot(slot, property)};`);
                                break;
                            }
                        }
                        continue;
                    }
                    out.push(`${key};`);
                }
                catch (e) {
                    if (e instanceof Error)
                        out.push(key + ' ' + e.message + '; ');
                }
            }
            scope.settings.logCallback.call(scope, `Log[${scope.position}]: `, out);
        }
        catch (e) {
            console.debug(e);
        }
    }
    function setDevice(device, args) {
        const d = scope.memory.getDevice(device);
        switch (args.length) {
            case 0:
                throw new Ic10Error_1.Ic10Error("Missing arguments");
            case 1:
                d.set("PrefabHash", scope.memory.getValue(args[0]));
                break;
            case 2:
                d.set(args[0], scope.memory.getValue(args[1]));
                break;
            case 3:
                d.setSlot(scope.memory.getValue(args[0]), args[1], scope.memory.getValue(args[2]));
        }
    }
    const dev = (device) => function () {
        setDevice(device, arguments);
    };
    return {
        _log: log,
        _debug: log,
        _d0: dev("d0"),
        _d1: dev("d1"),
        _d2: dev("d2"),
        _d3: dev("d3"),
        _d4: dev("d4"),
        _d5: dev("d5"),
        _db: dev("db")
    };
};
exports.makeDebugCommands = makeDebugCommands;
//# sourceMappingURL=debug.js.map