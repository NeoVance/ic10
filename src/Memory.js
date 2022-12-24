"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const main_1 = require("./main");
const Environ_1 = require("./Environ");
const MemoryCell_1 = require("./MemoryCell");
const MemoryStack_1 = require("./MemoryStack");
const Device_1 = require("./Device");
const ConstantCell_1 = require("./ConstantCell");
class Memory {
    cells;
    environ;
    aliases;
    #scope;
    constructor(scope) {
        this.#scope = scope;
        this.cells = new Array(15);
        this.environ = new Environ_1.Environ(scope);
        this.aliases = {};
        for (let i = 0; i < 18; i++) {
            if (i === 16) {
                this.cells[i] = new MemoryStack_1.MemoryStack(scope, 'r' + i);
            }
            else {
                this.cells[i] = new MemoryCell_1.MemoryCell(scope, 'r' + i);
            }
        }
    }
    get scope() {
        return null;
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
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, m1);
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
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
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
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
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
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
                }
            }
            if (String(cell).trim().match(/[\d/.]+/)) {
                return parseFloat(cell);
            }
            throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
        }
        return cell;
    }
    getCell(cell) {
        if (typeof cell === "string") {
            if (cell == 'sp')
                return this.cells[16];
            if (cell == 'ra')
                cell = 'r17';
            if (main_1.regexes.rr1.test(cell)) {
                let m = main_1.regexes.rr1.exec(cell);
                if (m) {
                    const index = cell.replace(m[1], this.cell(m[1]));
                    let m1 = this.getCell(index);
                    if (m1) {
                        return m1;
                    }
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, m1);
                }
                throw main_1.Execution.error(this.#scope.position, 'Syntax error');
            }
            if (main_1.regexes.r1.test(cell)) {
                let m = main_1.regexes.r1.exec(cell);
                if (m) {
                    const index = parseInt(m[1]);
                    if (index in this.cells) {
                        return this.cells[index];
                    }
                }
                throw main_1.Execution.error(this.#scope.position, 'Syntax error');
            }
            if (main_1.regexes.d1.test(cell)) {
                if (cell in this.environ) {
                    return this.environ.get(cell);
                }
                else {
                    throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
                }
            }
            if (cell in this.aliases) {
                return this.aliases[cell];
            }
            throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
        }
        if (cell >= 18)
            throw main_1.Execution.error(this.#scope.position, 'Unknown cell ' + __filename, cell);
        return this.cells[cell];
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
        throw main_1.Execution.error(this.#scope.position, 'Invalid alias value' + __filename);
    }
    define(name, value) {
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