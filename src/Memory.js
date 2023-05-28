"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const main_1 = require("./main");
const Environ_1 = require("./Environ");
const MemoryCell_1 = require("./MemoryCell");
const MemoryStack_1 = require("./MemoryStack");
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
        if (!Utils_1.patterns.reg.test(v.name))
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
        const register = this.findRegister(link);
        if (register !== undefined) {
            this.aliases[name] = register;
            return this;
        }
        const device = this.findDevice(link);
        if (device !== undefined) {
            this.aliases[name] = device;
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
                out['r' + i] = this.cells[i].value;
            }
            else {
                out['r' + i] = this.cells[i].value;
                out['stack'] = this.cells[i].value;
            }
        }
        return out;
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map