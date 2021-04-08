var fs = require('fs');
var { InterpreterIc10 } = require('./main');
var text = fs.readFileSync(".ic10", "utf8");
new InterpreterIc10(text).run();
//# sourceMappingURL=test.js.map