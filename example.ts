import fs              from "fs";
import {Ic10Error}                  from "./src/ic10Error";
import InterpreterIc10, {Execution} from "./src/main";

const code     = fs.readFileSync(".ic10", "utf8");
const settings = {
  debug            : true,
  debugCallback    : function () {
    console.log(...arguments)
  },
  logCallback      : function () {
    console.log(...arguments)
  },
  executionCallback: function (e: Ic10Error) {
    Execution.display(e)
  },
};
// console.log(code)
const interpreterIc10 = new InterpreterIc10(code, settings);
// OR
interpreterIc10.init(code)

interpreterIc10.run()

