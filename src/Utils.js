"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patterns = void 0;
exports.patterns = {
    'reg': /^(?<prefix>r*)r(?<index>0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$/,
    'dev': /^d([012345b])$/,
    'recDev': /^d(?<prefix>r+)(?<index>0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$/,
    'strStart': /^".+$/,
    'strEnd': /.+"$/,
};
//# sourceMappingURL=Utils.js.map