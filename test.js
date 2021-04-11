"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const fs_1 = __importDefault(require("fs"));
var code = fs_1.default.readFileSync(".ic10", "utf8");
var settings = {
    debug: true,
    debugCallback: function () {
        console.log(...arguments);
    },
    logCallback: function () {
        console.log(...arguments);
    },
    executionCallback: function (e) {
        main_1.Execution.display(e);
    },
};
console.log(code);
var interpreterIc10 = new main_1.InterpreterIc10(code, settings);
interpreterIc10.init(code);
interpreterIc10.run();
//# sourceMappingURL=test.js.map