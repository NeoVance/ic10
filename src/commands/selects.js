"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSelectCommands = void 0;
const makeSelectCommands = (scope, conditions) => {
    const cd = conditions;
    function __sOp(op, register, ...args) {
        const r = scope.memory.getRegister(register);
        const inputs = args.map(v => scope.memory.getValue(v));
        r.value = op(...inputs) ? 1 : 0;
    }
    const seq = (register, a, b) => {
        __sOp(cd.eq, register, a, b);
    };
    const seqz = (register, a) => {
        __sOp(cd.eq, register, a);
    };
    const sge = (register, a, b) => {
        __sOp(cd.ge, register, a, b);
    };
    const sgez = (register, a) => {
        __sOp(cd.ge, register, a);
    };
    const sgt = (register, a, b) => {
        __sOp(cd.gt, register, a, b);
    };
    const sgtz = (register, a) => {
        __sOp(cd.gt, register, a);
    };
    const sle = (register, a, b) => {
        __sOp(cd.le, register, a, b);
    };
    const slez = (register, a) => {
        __sOp(cd.le, register, a);
    };
    const slt = (register, a, b) => {
        __sOp(cd.lt, register, a, b);
    };
    const sltz = (register, a) => {
        __sOp(cd.lt, register, a);
    };
    const sne = (register, a, b) => {
        __sOp(cd.ne, register, a, b);
    };
    const snez = (register, a) => {
        __sOp(cd.ne, register, a);
    };
    const sap = (register, x, y, c) => {
        __sOp(cd.ap, register, x, y, c);
    };
    const sapz = (register, x, y) => {
        __sOp(cd.ap, register, x, y);
    };
    const sna = (register, x, y, c) => {
        __sOp(cd.na, register, x, y, c);
    };
    const snaz = (register, x, y) => {
        __sOp(cd.na, register, x, y);
    };
    const sdse = (register, d) => {
        scope.memory.getRegister(register).value = Number(cd.dse(d));
    };
    const sdns = (register, d) => {
        scope.memory.getRegister(register).value = Number(cd.dns(d));
    };
    const snan = (register, v) => {
        __sOp(cd.nan, register, v);
    };
    const snanz = (register, v) => {
        __sOp(cd.nanz, register, v);
    };
    return {
        seq, seqz, sge, sgez, sgt, sgtz, sle, slez, slt, sltz, sne, snez, sap, sapz, sna, snaz, sdse, sdns, snan, snanz
    };
};
exports.makeSelectCommands = makeSelectCommands;
//# sourceMappingURL=selects.js.map