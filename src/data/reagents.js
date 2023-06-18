"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReagentMode = exports.reverseReagentModeMapping = exports.reagentModeMapping = exports.getReagent = exports.isReagent = exports.reverseReagentMapping = exports.reagentMapping = exports.reagents = void 0;
const types_1 = require("../types");
const Utils_1 = require("../Utils");
const icTypes_1 = require("../icTypes");
exports.reagents = [
    "Astroloy",
    "Hastelloy",
    "Inconel",
    "Stellite",
    "Waspaloy",
    "Constantan",
    "Electrum",
    "Invar",
    "Solder",
    "Steel",
    "Copper",
    "Gold",
    "Iron",
    "Lead",
    "Nickel",
    "Silicon",
    "Silver",
    "Hydrocarbon"
];
exports.reagentMapping = (0, types_1.arrToObj)(exports.reagents, n => [n, (0, Utils_1.hashStr)(n)]);
exports.reverseReagentMapping = (0, types_1.reverseMapping)(exports.reagentMapping);
const isReagent = (v) => exports.reagents.includes(v);
exports.isReagent = isReagent;
const getReagent = (v) => {
    if (typeof v === "string") {
        if ((0, exports.isReagent)(v))
            return v;
        return undefined;
    }
    return exports.reverseReagentMapping[v];
};
exports.getReagent = getReagent;
exports.reagentModeMapping = {
    Contents: 0,
    Required: 1,
    Recipe: 2
};
exports.reverseReagentModeMapping = (0, types_1.reverseMapping)(exports.reagentModeMapping);
const getReagentMode = (v) => {
    if (typeof v === "string") {
        if ((0, icTypes_1.isRM)(v))
            return v;
        return undefined;
    }
    return exports.reverseReagentModeMapping[v];
};
exports.getReagentMode = getReagentMode;
//# sourceMappingURL=reagents.js.map