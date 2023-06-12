"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDevice = exports.isRegister = exports.isSimplePort = exports.isRecPort = exports.isPort = exports.isNumber = exports.isHash = exports.hashStr = exports.patterns = void 0;
const crc_1 = require("crc");
const devices_1 = __importDefault(require("./data/devices"));
exports.patterns = {
    reg: /^(?<prefix>r*)r(?<index>0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$/,
    dev: /^d([012345b])$/,
    recDev: /^d(?<prefix>r+)(?<index>0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$/,
    strStart: /^".+$/,
    strEnd: /.+"$/,
    hash: /^HASH\("(?<hash>.+)"\)$/
};
const hashStr = (name) => (0, crc_1.crc32)(name) | 0;
exports.hashStr = hashStr;
const isHash = (value) => exports.patterns.hash.test(value);
exports.isHash = isHash;
const isNumber = (value) => {
    const regex = /^-?\d+(?:.\d+)?$/gm;
    return regex.exec(value.trim()) !== null;
};
exports.isNumber = isNumber;
const isPort = (value) => (0, exports.isSimplePort)(value) || (0, exports.isRecPort)(value);
exports.isPort = isPort;
const isRecPort = (value) => exports.patterns.recDev.test(value);
exports.isRecPort = isRecPort;
const isSimplePort = (value) => exports.patterns.dev.test(value);
exports.isSimplePort = isSimplePort;
const isRegister = (value) => exports.patterns.reg.test(value);
exports.isRegister = isRegister;
const findDevice = (HashOrName) => {
    let hash = 0;
    if (typeof HashOrName === "number")
        hash = HashOrName;
    if (typeof HashOrName === "string")
        hash = (0, exports.hashStr)(HashOrName);
    const _hash = String(hash);
    return devices_1.default['devices'][devices_1.default['assoc'][_hash]];
};
exports.findDevice = findDevice;
//# sourceMappingURL=Utils.js.map