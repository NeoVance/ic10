"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeJumpCommands = void 0;
const Ic10Error_1 = require("../Ic10Error");
const makeJumpCommands = (scope, conditions) => {
    const cd = conditions;
    const __jump = (line) => scope.position = line;
    const __call = (line) => {
        scope.memory.getRegister("ra").value = scope.position;
        __jump(line);
    };
    const __issetLabel = (x) => x in scope.labels;
    const __getJumpTarget = (target) => {
        if (__issetLabel(target))
            return scope.labels[target];
        const line = scope.memory.getValue(target);
        if (isNaN(line))
            throw new Ic10Error_1.Ic10DiagnosticError('Incorrect jump target', target);
        return line;
    };
    const j = (target) => __jump(__getJumpTarget(target));
    const jr = (offset) => {
        const d = scope.memory.getValue(offset);
        if (Math.abs(d) < 0.001)
            throw new Ic10Error_1.Ic10Error('Infinite loop detected caused by', offset);
        __jump(scope.position + d - 1);
    };
    const jal = (target) => __call(__getJumpTarget(target));
    function __bOp(op, line, ...args) {
        const inputs = args.map(v => scope.memory.getValue(v));
        if (!op(...inputs))
            return;
        j(line);
    }
    function __bROp(op, offset, ...args) {
        const inputs = args.map(v => scope.memory.getValue(v));
        if (!op(...inputs))
            return;
        jr(offset);
    }
    function __bCOp(op, line, ...args) {
        const inputs = args.map(v => scope.memory.getValue(v));
        if (!op(...inputs))
            return;
        jal(line);
    }
    const beq = (a, b, line) => __bOp(cd.eq, line, a, b);
    const beqz = (a, line) => __bOp(cd.eq, line, a);
    const bge = (a, b, line) => __bOp(cd.ge, line, a, b);
    const bgez = (a, line) => __bOp(cd.ge, line, a);
    const bgt = (a, b, line) => __bOp(cd.gt, line, a, b);
    const bgtz = (a, line) => __bOp(cd.gt, line, a);
    const ble = (a, b, line) => __bOp(cd.le, line, a, b);
    const blez = (a, line) => __bOp(cd.le, line, a);
    const blt = (a, b, line) => __bOp(cd.lt, line, a, b);
    const bltz = (a, line) => __bOp(cd.lt, line, a);
    const bne = (a, b, line) => __bOp(cd.ne, line, a, b);
    const bnez = (a, line) => __bOp(cd.ne, line, a);
    const bap = (x, y, c, line) => __bOp(cd.ap, line, x, y, c);
    const bapz = (x, y, line) => __bOp(cd.ap, line, x, y);
    const bna = (x, y, c, line) => __bOp(cd.na, line, x, y, c);
    const bnaz = (x, y, line) => __bOp(cd.na, line, x, y);
    const bdse = (d, line) => {
        if (cd.dse(d))
            j(line);
    };
    const bdns = (d, line) => {
        if (cd.dns(d))
            j(line);
    };
    const bnan = (v, line) => __bOp(cd.nan, line, v);
    const breq = (a, b, offset) => __bROp(cd.eq, offset, a, b);
    const breqz = (a, offset) => __bROp(cd.eq, offset, a);
    const brge = (a, b, offset) => __bROp(cd.ge, offset, a);
    const brgez = (a, offset) => __bROp(cd.ge, offset, a);
    const brgt = (a, b, offset) => __bROp(cd.gt, offset, a, b);
    const brgtz = (a, offset) => __bROp(cd.gt, offset, a);
    const brle = (a, b, offset) => __bROp(cd.le, offset, a, b);
    const brlez = (a, offset) => __bROp(cd.le, offset, a);
    const brlt = (a, b, offset) => __bROp(cd.lt, offset, a, b);
    const brltz = (a, offset) => __bROp(cd.lt, offset, a);
    const brne = (a, b, offset) => __bROp(cd.ne, offset, a, b);
    const brnez = (a, offset) => __bROp(cd.ne, offset, a);
    const brap = (x, y, c, offset) => __bROp(cd.ap, offset, x, y, c);
    const brapz = (x, y, offset) => __bROp(cd.ap, offset, x, y);
    const brna = (x, y, c, offset) => __bROp(cd.na, offset, x, y, c);
    const brnaz = (x, y, offset) => __bROp(cd.ap, offset, x, y);
    const brdse = (d, offset) => {
        if (cd.dse(d))
            jr(offset);
    };
    const brdns = (d, offset) => {
        if (cd.dns(d))
            jr(offset);
    };
    const brnan = (v, offset) => __bROp(cd.nan, offset, v);
    const beqal = (a, b, line) => __bCOp(cd.eq, line, a, b);
    const beqzal = (a, line) => __bCOp(cd.eq, line, a);
    const bgeal = (a, b, line) => __bCOp(cd.ge, line, a, b);
    const bgezal = (a, line) => __bCOp(cd.ge, line, a);
    const bgtal = (a, b, line) => __bCOp(cd.gt, line, a, b);
    const bgtzal = (a, line) => __bCOp(cd.gt, line, a);
    const bleal = (a, b, line) => __bCOp(cd.le, line, a, b);
    const blezal = (a, line) => __bCOp(cd.le, line, a);
    const bltal = (a, b, line) => __bCOp(cd.lt, line, a, b);
    const bltzal = (a, line) => __bCOp(cd.lt, line, a);
    const bneal = (a, b, line) => __bCOp(cd.ne, line, a, b);
    const bnezal = (a, line) => __bCOp(cd.ne, line, a);
    const bapal = (x, y, c, line) => __bCOp(cd.ap, line, x, y, c);
    const bapzal = (x, y, line) => __bCOp(cd.ap, line, x, y);
    const bnaal = (x, y, c, line) => __bCOp(cd.na, line, x, y, c);
    const bnazal = (x, y, line) => __bCOp(cd.na, line, x, y);
    const bdseal = (d, line) => {
        if (cd.dse(d))
            jal(line);
    };
    const bdnsal = (d, line) => {
        if (cd.dns(d))
            jal(line);
    };
    return {
        j, jr, jal,
        beq, beqz, bge, bgez, bgt, bgtz, ble, blez, blt, bltz, bne, bnez, bap, bapz, bna, bnaz, bdse, bdns, bnan,
        breq, breqz, brge, brgez, brgt, brgtz, brle, brlez, brlt, brltz, brne, brnez, brap, brapz, brna, brnaz, brdse, brdns, brnan,
        beqal, beqzal, bgeal, bgezal, bgtal, bgtzal, bleal, blezal, bltal, bltzal, bneal, bnezal, bapal, bapzal, bnaal, bnazal, bdseal, bdnsal
    };
};
exports.makeJumpCommands = makeJumpCommands;
//# sourceMappingURL=jumps.js.map