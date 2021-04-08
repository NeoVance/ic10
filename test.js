"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
var fs = require('fs');
var code = fs.readFileSync(".ic10", "utf8");
var settings = {
    debug: true,
    debugCallback: function () {
        console.log(...arguments);
    },
    logCallback: function () {
        console.log(...arguments);
    },
    executionCallback: function (e) {
    },
};
var interpreterIc10 = new main_1.InterpreterIc10(code, settings);
interpreterIc10.init(code);
interpreterIc10.run();
//# sourceMappingURL=test.js.map