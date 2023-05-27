"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const main_1 = require("./main");
const Environ_1 = require("./Environ");
const MemoryCell_1 = require("./MemoryCell");
const MemoryStack_1 = require("./MemoryStack");
const Device_1 = require("./Device");
const ConstantCell_1 = require("./ConstantCell");
const Utils_1 = require("./Utils");
class Memory {
    cells;
    stack;
    environ;
    aliases;
    #scope;
    constructor(scope) {
        this.#scope = scope;
        this.cells = new Array(18);
        this.environ = new Environ_1.Environ(scope);
        this.stack = new MemoryStack_1.MemoryStack(scope, 512, "r16");
        this.aliases = {};
        for (let i = 0; i < 18; i++) {
            const n = `r${i}`;
            if (i === 16) {
                this.cells[i] = this.stack;
            }
            else {
                this.cells[i] = new MemoryCell_1.MemoryCell(scope, n);
            }
            this.cells[i].value = 0;
        }
    }
    get scope() {
        return this.#scope;
    }
    cell(cell, op1 = null, op2 = null) {
        if (typeof cell === "string") {
            if (cell == 'sp')
                cell = 'r16';
            if (cell == 'ra')
                cell = 'r17';
            if (main_1.regexes.rr1.test(cell)) {
                let m = main_1.regexes.rr1.exec(cell);
                if (m) {
                    let m1 = this.cell(cell.replace(m[1], this.cell(m[1])), op1, op2) ?? false;
                    if (m1 !== false) {
                        return m1;
                    }
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell', m1);
                }
                throw main_1.Execution.error(this.#scope.position, 'Syntax error');
            }
            if (main_1.regexes.r1.test(cell)) {
                let m = main_1.regexes.r1.exec(cell);
                if (m && m[1] in this.cells) {
                    const index = parseInt(m[1]);
                    if (op1 === null) {
                        return this.cells[index].get();
                    }
                    else {
                        return this.cells[index].set(null, this.cell(op1));
                    }
                }
                else {
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (main_1.regexes.d1.test(cell)) {
                if (cell in this.environ) {
                    if (op1 === null) {
                        throw main_1.Execution.error(this.#scope.position, 'Have not `Port`', cell);
                    }
                    else {
                        if (op2 !== null) {
                            return this.environ.get(cell)?.set(op1, this.cell(op2));
                        }
                        return this.environ.get(cell)?.get(op1);
                    }
                }
                else {
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (cell in this.aliases) {
                if (this.aliases[cell].constructor.name === 'MemoryCell') {
                    if (op1 === null) {
                        return this.aliases[cell].get(null);
                    }
                    else {
                        return this.aliases[cell].set(null, this.cell(op1));
                    }
                }
                else if (this.aliases[cell] instanceof Device_1.Device) {
                    if (op1 === null) {
                        throw main_1.Execution.error(this.#scope.position, 'Have not `Port`', cell);
                    }
                    else {
                        if (op2 !== null) {
                            return this.aliases[cell].set(op1, this.cell(op2));
                        }
                        return this.aliases[cell].get(op1);
                    }
                }
                else if (this.aliases[cell] instanceof ConstantCell_1.ConstantCell) {
                    return this.aliases[cell].get(null);
                }
                else {
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (String(cell).trim().match(/[\d/.]+/)) {
                return parseFloat(cell);
            }
            throw main_1.Execution.error(this.#scope.position, 'Unknown cell', cell);
        }
        return cell;
    }
    getCell(cell) {
        const reg = this.findRegister(cell);
        if (reg)
            return reg;
        const device = this.findDevice(cell);
        if (device)
            return device;
        if (typeof cell === "string" && cell in this.aliases)
            return this.aliases[cell];
        throw main_1.Execution.error(this.#scope.position, 'Unknown cell', cell);
    }
    findRegister(name) {
        const mapping = {
            sp: "r16",
            ra: "r17"
        };
        name = mapping[name] ?? name;
        if (typeof name === "string") {
            if (Utils_1.patterns.reg.test(name)) {
                let m = Utils_1.patterns.reg.exec(name);
                if (!m)
                    throw main_1.Execution.error(this.#scope.position, 'Syntax error');
                const prefix = m.groups?.prefix ?? "";
                const indexStr = m.groups?.index ?? "none";
                const index = parseInt(indexStr);
                let cell = this.cells[index];
                for (let i = 0; i < prefix.length; ++i) {
                    cell = this.cells[cell.value];
                    if (cell === undefined)
                        break;
                }
                if (cell !== undefined)
                    return cell;
            }
            if (name in this.aliases) {
                const mem = this.aliases[name];
                if (Utils_1.patterns.reg.test(mem.name))
                    return mem;
            }
            return undefined;
        }
        if (name >= 18)
            throw main_1.Execution.error(this.#scope.position, 'Unknown register', name);
        return this.cells[name];
    }
    getRegister(name) {
        const reg = this.findRegister(name);
        if (!reg)
            throw main_1.Execution.error(this.#scope.position, 'Not a register', name);
        return reg;
    }
    findDevice(name) {
        if (typeof name === "number")
            name = `d${name}`;
        if (Utils_1.patterns.dev.test(name))
            return this.environ.get(name);
        if (Utils_1.patterns.recDev.test(name)) {
            const m = Utils_1.patterns.recDev.exec(name);
            if (!m)
                throw main_1.Execution.error(this.#scope.position, 'Syntax error');
            const prefix = (m.groups?.prefix ?? "");
            const indexStr = m.groups?.index ?? "none";
            const index = this.getRegister(`${prefix}${indexStr}`).value;
            return this.environ.get(`d${index}`);
        }
        if (name in this.aliases) {
            const mem = this.aliases[name];
            if (Utils_1.patterns.dev.test(mem.name))
                return mem;
        }
        return undefined;
    }
    getDevice(name) {
        const device = this.findDevice(name);
        if (!device)
            throw main_1.Execution.error(this.#scope.position, 'Unknown device', name);
        return device;
    }
    findValue(value) {
        if (typeof value === "number")
            return value;
        const n = Number(value);
        if (!isNaN(n))
            return n;
        const v = this.aliases[value];
        if (!v) {
            const r = this.findRegister(value);
            if (r)
                return r.value;
            return undefined;
        }
        if (typeof (v.value) !== "number")
            return undefined;
        return v.value;
    }
    getValue(value) {
        const v = this.findValue(value);
        if (v === undefined)
            throw main_1.Execution.error(this.#scope.position, 'Unknown value', v);
        return v;
    }
    alias(name, link) {
        const result = this.getCell(link);
        if (typeof result !== 'number') {
            this.aliases[name] = result;
            if (this.aliases[name] instanceof MemoryCell_1.MemoryCell) {
                this.aliases[name].alias = name;
            }
            return this;
        }
        throw main_1.Execution.error(this.#scope.position, 'Invalid alias value');
    }
    define(name, value) {
        if (typeof value === "string")
            value = parseInt(value);
        this.aliases[name] = new ConstantCell_1.ConstantCell(value, this.#scope, name);
    }
    toLog() {
        const out = {};
        for (let i = 0; i < 18; i++) {
            if (i === 16) {
                out['r' + i] = this.cells[i].get();
            }
            else {
                out['r' + i] = this.cells[i].get();
                out['stack'] = this.cells[i].value;
            }
        }
        return out;
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map