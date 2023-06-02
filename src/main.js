"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpreterIc10 = exports.Execution = void 0;
const Ic10Error_1 = require("./Ic10Error");
const Memory_1 = require("./Memory");
const Device_1 = require("./Device");
const icTypes_1 = require("./icTypes");
const DeviceOutput_1 = require("./DeviceOutput");
const regexes = {
    strStart: new RegExp("^\".+$"),
    strEnd: new RegExp(".+\"$"),
};
const modes = {
    Average: 0,
    Sum: 1,
    Minimum: 2,
    Maximum: 3
};
exports.Execution = {
    error(code, message, obj = null, loc) {
        return new Ic10Error_1.Ic10Error('--', code, message, obj, 0, loc);
    },
    Ic10DiagnosticError(code, message, obj = null, loc) {
        return new Ic10Error_1.Ic10DiagnosticError('--', code, message, obj, 0, loc);
    },
    display: function (e) {
        if (e instanceof Ic10Error_1.Ic10Error) {
            const string = `(${e.code}) - ${e.message}:`;
            switch (e.lvl) {
                case 0:
                    console.error('ERROR ' + string, e.obj);
                    break;
                case 1:
                    console.warn('WARN ' + string, e.obj);
                    break;
                case 2:
                    console.info('INFO ' + string, e.obj);
                    break;
                case 3:
                default:
                    console.log('LOG ' + string, e.obj);
                    break;
            }
            return string;
        }
        else {
            console.log(e);
            return e;
        }
    }
};
class InterpreterIc10 {
    code;
    commands = [];
    lines = [];
    memory;
    position = 0;
    interval;
    labels = {};
    constants;
    output;
    settings;
    ignoreLine;
    device;
    constructor(code = '', settings = {}) {
        this.code = code;
        this.memory = new Memory_1.Memory(this);
        this.constants = {};
        this.labels = {};
        this.ignoreLine = [];
        this.settings = Object.assign({
            debug: true,
            tickTime: 100,
            debugCallback: (a, b) => {
                this.output.debug = a + ' ' + JSON.stringify(b);
            },
            logCallback: (a, b) => {
                this.output.log = a + ' ' + b.join('');
            },
            executionCallback: (e) => {
                this.output.error = exports.Execution.display(e);
            },
        }, settings);
        if (code) {
            this.init(code);
        }
        this.output = {
            debug: '',
            log: '',
            error: '',
        };
    }
    setSettings(settings = {}) {
        this.settings = Object.assign(this.settings, settings);
        return this;
    }
    init(text, device) {
        this.memory.reset();
        if (device !== undefined) {
            const ics = device.slots
                .filter(s => s.has("OccupantHash") && s.get("OccupantHash") === Device_1.IcHash);
            if (ics.length === 1) {
                this.device = device;
                this.memory.environ.db = device;
                device.name = "db";
            }
        }
        this.lines = text.split(/\r?\n/);
        const commands = this.lines
            .map((line) => {
            const args = line.trim().split(/ +/);
            const command = args.shift();
            return { command, args };
        });
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey];
                const newArgs = {};
                let mode = 0;
                let argNumber = 0;
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey];
                        if (arg.startsWith("#"))
                            break;
                        if (mode === 0)
                            argNumber++;
                        if (regexes.strStart.test(arg))
                            mode = 1;
                        if (argNumber in newArgs)
                            newArgs[argNumber] += ' ' + arg;
                        else
                            newArgs[argNumber] = arg;
                        if (regexes.strEnd.test(arg))
                            mode = 0;
                    }
                }
                commands[commandsKey].args = Object.values(newArgs);
            }
            else
                commands.push({ command: '', args: [] });
        }
        this.commands = commands;
        this.position = 0;
        while (this.position < this.commands.length) {
            let { command, args } = this.commands[this.position];
            this.position++;
            if (command?.match(/^\w+:$/)) {
                let label = command.replace(":", "");
                this.labels[command.replace(":", "")] = this.position;
                this.memory.define(label, this.position);
            }
        }
        this.position = 0;
        this.__updateDevice();
        return this;
    }
    __updateDevice() {
        if (this.device === undefined)
            return;
        if (this.device.has("LineNumber"))
            this.device.set("LineNumber", this.position);
        this.device.slots.forEach(slot => {
            if (slot.has("LineNumber"))
                slot.set("LineNumber", this.position);
        });
    }
    stop() {
        clearInterval(this.interval);
        return this;
    }
    async run() {
        return new Promise((resolve) => {
            this.interval = setInterval(() => {
                const why = this.prepareLine();
                if (why !== true) {
                    this.settings.debugCallback.call(this, why, []);
                    clearInterval(this.interval);
                }
            }, this.settings.tickTime);
            resolve(this);
        });
    }
    prepareLine(line = -1, isDebugger = false) {
        if (line >= 0) {
            this.position = line;
        }
        if (!(this.position in this.commands)) {
            return 'end';
        }
        let { command, args } = this.commands[this.position];
        this.position++;
        let isComment = true;
        if (command && command != '' && !command.trim().endsWith(":")) {
            isComment = command.startsWith("#");
            for (const argsKey in args) {
                let a = parseFloat(args[argsKey]);
                if (!isNaN(a)) {
                    args[argsKey] = String(a);
                }
            }
            try {
                if (command === "#die")
                    return 'die';
                command = command.replace("#", "_");
                if (command in this) {
                    this[command](...args);
                    this.__updateDevice();
                    this.__debug(command, args);
                }
                else if (!isComment) {
                    throw exports.Execution.error(this.position, 'Undefined function', command);
                }
            }
            catch (e) {
                if (e instanceof Ic10Error_1.Ic10Error)
                    this.settings.executionCallback.call(this, e);
                else
                    throw e;
            }
        }
        if (command === "hcf")
            return 'hcf';
        if (isComment) {
            this.ignoreLine.push(this.position);
        }
        if (!isDebugger) {
            return isComment && this.position < this.commands.length
                ? this.prepareLine()
                : this.position < this.commands.length ? true : 'end';
        }
        else {
            return this.position < this.commands.length ? true : 'end';
        }
    }
    runUntil(cond, maxIterations = 0) {
        let status = true;
        let n = 0;
        do {
            status = this.prepareLine();
            n++;
        } while (!cond(status) && (maxIterations <= 0 || n <= maxIterations));
        return n;
    }
    __issetLabel(x) {
        return x in this.labels;
    }
    define(alias, value) {
        if ((0, icTypes_1.isChannel)(alias.toLowerCase()) || (0, icTypes_1.isSlotParameter)(alias.toLowerCase()) || (0, icTypes_1.isDeviceParameter)(alias.toLowerCase()) || (0, icTypes_1.isConst)(alias.toLowerCase())) {
            throw exports.Execution.Ic10DiagnosticError(this.position, 'Incorrect constant. Is system keyworld', alias);
        }
        this.memory.define(alias, value);
    }
    alias(alias, target) {
        if ((0, icTypes_1.isChannel)(alias.toLowerCase()) || (0, icTypes_1.isSlotParameter)(alias.toLowerCase()) || (0, icTypes_1.isDeviceParameter)(alias.toLowerCase()) || (0, icTypes_1.isConst)(alias.toLowerCase())) {
            throw exports.Execution.Ic10DiagnosticError(this.position, 'Incorrect alias. Is system keyworld', alias);
        }
        this.memory.alias(alias, target);
    }
    __op(op, register, ...args) {
        const r = this.memory.getRegister(register);
        const inputs = args.map(v => this.memory.getValue(v));
        r.value = op(...inputs);
    }
    move(register, value) {
        this.__op(v => v, register, value);
    }
    __move(register, value) {
        this.move(register, value);
    }
    add(register, a, b) {
        this.__op((a, b) => a + b, register, a, b);
    }
    sub(register, a, b) {
        this.__op((a, b) => a - b, register, a, b);
    }
    mul(register, a, b) {
        this.__op((a, b) => a * b, register, a, b);
    }
    div(register, a, b) {
        this.__op((a, b) => Number(a / b) || 0, register, a, b);
    }
    mod(register, a, b) {
        this.__op((a, b) => a % b, register, a, b);
    }
    sqrt(register, v) {
        this.__op(Math.sqrt, register, v);
    }
    round(register, v) {
        this.__op(Math.round, register, v);
    }
    trunc(register, v) {
        this.__op(Math.trunc, register, v);
    }
    ceil(register, v) {
        this.__op(Math.ceil, register, v);
    }
    floor(register, v) {
        this.__op(Math.floor, register, v);
    }
    max(register, a, b) {
        this.__op(Math.max, register, a, b);
    }
    minx(register, a, b) {
        this.__op(Math.min, register, a, b);
    }
    abs(register, v) {
        this.__op(Math.abs, register, v);
    }
    log(register, v) {
        this.__op(Math.log, register, v);
    }
    exp(register, v) {
        this.__op(Math.exp, register, v);
    }
    rand(register, v) {
        this.__op(_ => Math.random(), register, v);
    }
    sin(register, v) {
        this.__op(Math.sin, register, v);
    }
    cos(register, v) {
        this.__op(Math.cos, register, v);
    }
    tan(register, v) {
        this.__op(Math.tan, register, v);
    }
    asin(register, v) {
        this.__op(Math.asin, register, v);
    }
    acos(register, v) {
        this.__op(Math.acos, register, v);
    }
    atan(register, v) {
        this.__op(Math.atan, register, v);
    }
    atan2(register, a, b) {
        this.__op(Math.atan2, register, a, b);
    }
    yield() {
    }
    sleep(s) {
    }
    select(register, a, b, c) {
        this.__op((a, b, c) => a ? b : c, register, a, b, c);
    }
    hcf() {
        console.log("Die Mother Fucker Die!!!!!");
    }
    __jump(line) {
        this.position = line;
    }
    __call(line) {
        this.memory.getRegister("ra").value = this.position;
        this.__jump(line);
    }
    __getJumpTarget(target) {
        if (this.__issetLabel(target))
            return this.labels[target];
        const line = this.memory.getValue(target);
        if (isNaN(line))
            throw exports.Execution.Ic10DiagnosticError(this.position, 'Incorrect jump target', [target, this.labels]);
        return line;
    }
    j(target) {
        this.__jump(this.__getJumpTarget(target));
    }
    jr(offset) {
        const d = this.memory.getValue(offset);
        if (Math.abs(d) < 0.001)
            throw exports.Execution.error(this.position, "Infinite loop detected", offset);
        this.__jump(this.position + d - 1);
    }
    jal(target) {
        this.__call(this.__getJumpTarget(target));
    }
    __eq(a, b = 0) {
        return a == b;
    }
    __ge(a, b = 0) {
        return a >= b;
    }
    __gt(a, b = 0) {
        return a > b;
    }
    __le(a, b = 0) {
        return a <= b;
    }
    __lt(a, b = 0) {
        return a < b;
    }
    __ne(a, b = 0) {
        return a != b;
    }
    __ap(x, y, c = 0) {
        return !this.__na(x, y, c);
    }
    __na(x, y, c = 0) {
        return Math.abs(x - y) > c * Math.max(Math.abs(x), Math.abs(y));
    }
    __dse(d) {
        return this.memory.findDevice(d) !== undefined;
    }
    __dns(d) {
        return !this.__dse(d);
    }
    __nan(v) {
        return isNaN(this.memory.getValue(v));
    }
    __nanz(v) {
        return !this.__nan(v);
    }
    __sOp(op, register, ...args) {
        const r = this.memory.getRegister(register);
        const inputs = args.map(v => this.memory.getValue(v));
        r.value = op(...inputs) ? 1 : 0;
    }
    seq(register, a, b) {
        this.__sOp(this.__eq.bind(this), register, a, b);
    }
    seqz(register, a) {
        this.__sOp(this.__eq.bind(this), register, a);
    }
    sge(register, a, b) {
        this.__sOp(this.__ge.bind(this), register, a, b);
    }
    sgez(register, a) {
        this.__sOp(this.__ge.bind(this), register, a);
    }
    sgt(register, a, b) {
        this.__sOp(this.__gt.bind(this), register, a, b);
    }
    sgtz(register, a) {
        this.__sOp(this.__gt.bind(this), register, a);
    }
    sle(register, a, b) {
        this.__sOp(this.__le.bind(this), register, a, b);
    }
    slez(register, a) {
        this.__sOp(this.__le.bind(this), register, a);
    }
    slt(register, a, b) {
        this.__sOp(this.__lt.bind(this), register, a, b);
    }
    sltz(register, a) {
        this.__sOp(this.__lt.bind(this), register, a);
    }
    sne(register, a, b) {
        this.__sOp(this.__ne.bind(this), register, a, b);
    }
    snez(register, a) {
        this.__sOp(this.__ne.bind(this), register, a);
    }
    sap(register, x, y, c) {
        this.__sOp(this.__ap.bind(this), register, x, y, c);
    }
    sapz(register, x, y) {
        this.__sOp(this.__ap.bind(this), register, x, y);
    }
    sna(register, x, y, c) {
        this.__sOp(this.__na.bind(this), register, x, y, c);
    }
    snaz(register, x, y) {
        this.__sOp(this.__na.bind(this), register, x, y);
    }
    sdse(register, d) {
        this.memory.getRegister(register).value = Number(this.__dse(d));
    }
    sdns(register, d) {
        this.memory.getRegister(register).value = Number(this.__dns(d));
    }
    snan(register, v) {
        this.__sOp(this.__nan.bind(this), register, v);
    }
    snanz(register, v) {
        this.__sOp(this.__nanz.bind(this), register, v);
    }
    __bOp(op, line, ...args) {
        const inputs = args.map(v => this.memory.getValue(v));
        if (!op(...inputs))
            return;
        this.j(line);
    }
    __bROp(op, offset, ...args) {
        const inputs = args.map(v => this.memory.getValue(v));
        if (!op(...inputs))
            return;
        this.jr(offset);
    }
    __bCOp(op, line, ...args) {
        const inputs = args.map(v => this.memory.getValue(v));
        if (!op(...inputs))
            return;
        this.jal(line);
    }
    beq(a, b, line) {
        this.__bOp(this.__eq.bind(this), line, a, b);
    }
    beqz(a, line) {
        this.__bOp(this.__eq.bind(this), line, a);
    }
    bge(a, b, line) {
        this.__bOp(this.__ge.bind(this), line, a, b);
    }
    bgez(a, line) {
        this.__bOp(this.__ge.bind(this), line, a);
    }
    bgt(a, b, line) {
        this.__bOp(this.__gt.bind(this), line, a, b);
    }
    bgtz(a, line) {
        this.__bOp(this.__gt.bind(this), line, a);
    }
    ble(a, b, line) {
        this.__bOp(this.__le.bind(this), line, a, b);
    }
    blez(a, line) {
        this.__bOp(this.__le.bind(this), line, a);
    }
    blt(a, b, line) {
        this.__bOp(this.__lt.bind(this), line, a, b);
    }
    bltz(a, line) {
        this.__bOp(this.__lt.bind(this), line, a);
    }
    bne(a, b, line) {
        this.__bOp(this.__ne.bind(this), line, a, b);
    }
    bnez(a, line) {
        this.__bOp(this.__ne.bind(this), line, a);
    }
    bap(x, y, c, line) {
        this.__bOp(this.__ap.bind(this), line, x, y, c);
    }
    bapz(x, y, line) {
        this.__bOp(this.__ap.bind(this), line, x, y);
    }
    bna(x, y, c, line) {
        this.__bOp(this.__na.bind(this), line, x, y, c);
    }
    bnaz(x, y, line) {
        this.__bOp(this.__na.bind(this), line, x, y);
    }
    bdse(d, line) {
        if (this.__dse(d))
            this.j(line);
    }
    bdns(d, line) {
        if (this.__dns(d))
            this.j(line);
    }
    bnan(v, line) {
        this.__bOp(this.__nan.bind(this), line, v);
    }
    breq(a, b, offset) {
        this.__bROp(this.__eq.bind(this), offset, a, b);
    }
    breqz(a, offset) {
        this.__bROp(this.__eq.bind(this), offset, a);
    }
    brge(a, b, offset) {
        this.__bROp(this.__ge.bind(this), offset, a);
    }
    brgez(a, offset) {
        this.__bROp(this.__ge.bind(this), offset, a);
    }
    brgt(a, b, offset) {
        this.__bROp(this.__gt.bind(this), offset, a, b);
    }
    brgtz(a, offset) {
        this.__bROp(this.__gt.bind(this), offset, a);
    }
    brle(a, b, offset) {
        this.__bROp(this.__le.bind(this), offset, a, b);
    }
    brlez(a, offset) {
        this.__bROp(this.__le.bind(this), offset, a);
    }
    brlt(a, b, offset) {
        this.__bROp(this.__lt.bind(this), offset, a, b);
    }
    brltz(a, offset) {
        this.__bROp(this.__lt.bind(this), offset, a);
    }
    brne(a, b, offset) {
        this.__bROp(this.__ne.bind(this), offset, a, b);
    }
    brnez(a, offset) {
        this.__bROp(this.__ne.bind(this), offset, a);
    }
    brap(x, y, c, offset) {
        this.__bROp(this.__ap.bind(this), offset, x, y, c);
    }
    brapz(x, y, offset) {
        this.__bROp(this.__ap.bind(this), offset, x, y);
    }
    brna(x, y, c, offset) {
        this.__bROp(this.__na.bind(this), offset, x, y, c);
    }
    brnaz(x, y, offset) {
        this.__bROp(this.__ap.bind(this), offset, x, y);
    }
    brdse(d, offset) {
        if (this.__dse(d)) {
            this.jr(offset);
        }
    }
    brdns(d, offset) {
        if (this.__dns(d)) {
            this.jr(offset);
        }
    }
    brnan(v, offset) {
        this.__bROp(this.__nan.bind(this), offset, v);
    }
    beqal(a, b, line) {
        this.__bCOp(this.__eq.bind(this), line, a, b);
    }
    beqzal(a, line) {
        this.__bCOp(this.__eq.bind(this), line, a);
    }
    bgeal(a, b, line) {
        this.__bCOp(this.__ge.bind(this), line, a, b);
    }
    bgezal(a, line) {
        this.__bCOp(this.__ge.bind(this), line, a);
    }
    bgtal(a, b, line) {
        this.__bCOp(this.__gt.bind(this), line, a, b);
    }
    bgtzal(a, line) {
        this.__bCOp(this.__gt.bind(this), line, a);
    }
    bleal(a, b, line) {
        this.__bCOp(this.__le.bind(this), line, a, b);
    }
    blezal(a, line) {
        this.__bCOp(this.__le.bind(this), line, a);
    }
    bltal(a, b, line) {
        this.__bCOp(this.__lt.bind(this), line, a, b);
    }
    bltzal(a, line) {
        this.__bCOp(this.__lt.bind(this), line, a);
    }
    bneal(a, b, line) {
        this.__bCOp(this.__ne.bind(this), line, a, b);
    }
    bnezal(a, line) {
        this.__bCOp(this.__ne.bind(this), line, a);
    }
    bapal(x, y, c, line) {
        this.__bCOp(this.__ap.bind(this), line, x, y, c);
    }
    bapzal(x, y, line) {
        this.__bCOp(this.__ap.bind(this), line, x, y);
    }
    bnaal(x, y, c, line) {
        this.__bCOp(this.__na.bind(this), line, x, y, c);
    }
    bnazal(x, y, line) {
        this.__bCOp(this.__na.bind(this), line, x, y);
    }
    bdseal(d, line) {
        if (this.__dse(d)) {
            this.jal(line);
        }
    }
    bdnsal(d, line) {
        if (this.__dns(d)) {
            this.jal(line);
        }
    }
    push(a) {
        this.memory.stack.push(this.memory.getValue(a));
    }
    pop(register) {
        this.memory.getRegister(register).value = this.memory.stack.pop();
    }
    peek(register) {
        this.memory.getRegister(register).value = this.memory.stack.peek();
    }
    __transformBatch(values, mode) {
        const modeMapping = modes;
        const m = modeMapping[mode] ?? this.memory.getValue(mode);
        switch (m) {
            case modes.Average:
                return values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length;
            case modes.Sum:
                return values.reduce((partial_sum, a) => partial_sum + a, 0);
            case modes.Minimum:
                return Math.min(...values);
            case modes.Maximum:
                return Math.max(...values);
        }
        throw exports.Execution.Ic10DiagnosticError(this.position, "Unknown batch mode", mode);
    }
    __getDevices(hash, name) {
        const devices = [];
        for (let i = 0; i <= 5; i++) {
            const d = this.memory.getDevice('d' + i);
            if (d.hash == hash && (name === undefined || d.nameHash === name)) {
                devices.push(d);
            }
        }
        return devices;
    }
    l(register, device, property) {
        const r = this.memory.getRegister(register);
        const a = this.memory.getDeviceOrDeviceOutput(device);
        if (a instanceof Device_1.Device) {
            if (!(0, icTypes_1.isDeviceParameter)(property)) {
                throw exports.Execution.Ic10DiagnosticError(this.position, `Wrong 3 argument (${property}). Must be "Device parameter"`, property);
            }
        }
        else if (a instanceof DeviceOutput_1.DeviceOutput) {
            if (!(0, icTypes_1.isChannel)(property)) {
                throw exports.Execution.Ic10DiagnosticError(this.position, `Wrong 3 argument (${property}). Must be "Channel"`, property);
            }
        }
        r.value = a.get(property);
    }
    __l(register, device, property) {
        this.l(register, device, property);
    }
    ls(register, device, slot, property) {
        const r = this.memory.getRegister(register);
        const d = this.memory.getDevice(device);
        r.value = d.getSlot(this.memory.getValue(slot), property);
    }
    s(device, property, value) {
        const a = this.memory.getDeviceOrDeviceOutput(device);
        if (a instanceof Device_1.Device) {
            if (!(0, icTypes_1.isDeviceParameter)(property)) {
                throw exports.Execution.Ic10DiagnosticError(this.position, `Wrong 2 argument (${property}). Must be "Device parameter"`, property);
            }
        }
        else if (a instanceof DeviceOutput_1.DeviceOutput) {
            if (!(0, icTypes_1.isChannel)(property)) {
                throw exports.Execution.Ic10DiagnosticError(this.position, `Wrong 2 argument (${property}). Must be "Channel"`, property);
            }
        }
        a.set(property, this.memory.getValue(value));
    }
    __s(device, property, value) {
        this.s(device, property, value);
    }
    lb(register, deviceHash, property, mode) {
        const hash = this.memory.getValue(deviceHash);
        const devices = this.__getDevices(hash);
        const values = devices.map(d => d.get(property));
        if (values.length === 0)
            throw exports.Execution.Ic10DiagnosticError(this.position, 'Can`t find Device wich hash:', hash);
        this.memory.getRegister(register).value = this.__transformBatch(values, mode);
    }
    lr(register, device, mode, property) {
        throw exports.Execution.Ic10DiagnosticError(this.position, "lr not implemented yet");
    }
    sb(deviceHash, property, value) {
        const hash = this.memory.getValue(deviceHash);
        const v = this.memory.getValue(value);
        const devices = this.__getDevices(hash);
        devices.forEach(d => d.set(property, v));
    }
    lbn(targetRegister, deviceHash, nameHash, property, batchMode) {
        const hash = this.memory.getValue(deviceHash);
        const name = this.memory.getValue(nameHash);
        const devices = this.__getDevices(hash, name);
        const values = devices.map(d => d.get(property));
        if (values.length === 0)
            throw exports.Execution.error(this.position, 'Can`t find Device wich hash:', hash);
        this.memory.getRegister(targetRegister).value = this.__transformBatch(values, batchMode);
    }
    sbn(deviceHash, nameHash, property, value) {
        const hash = this.memory.getValue(deviceHash);
        const v = this.memory.getValue(value);
        const name = this.memory.getValue(nameHash);
        const devices = this.__getDevices(hash, name);
        devices.forEach(d => d.set(property, v));
    }
    lbs(register, deviceHash, slotIndex, property, batchMode) {
        const hash = this.memory.getValue(deviceHash);
        const slot = this.memory.getValue(slotIndex);
        const devices = this.__getDevices(hash);
        const values = devices.map(d => d.getSlot(slot, property));
        this.memory.getRegister(register).value = this.__transformBatch(values, batchMode);
    }
    lbns(register, deviceHash, nameHash, slotIndex, property, batchMode) {
        const hash = this.memory.getValue(deviceHash);
        const name = this.memory.getValue(nameHash);
        const slot = this.memory.getValue(slotIndex);
        const devices = this.__getDevices(hash, name);
        const values = devices.map(d => d.getSlot(slot, property));
        this.memory.getRegister(register).value = this.__transformBatch(values, batchMode);
    }
    ss(device, slotIndex, property, value) {
        const d = this.memory.getDevice(device);
        const v = this.memory.getValue(value);
        const slot = this.memory.getValue(slotIndex);
        d.getSlot(slot).set(property, v);
    }
    sbs(deviceHash, slotIndex, property, value) {
        const hash = this.memory.getValue(deviceHash);
        const v = this.memory.getValue(value);
        const slot = this.memory.getValue(slotIndex);
        const devices = this.__getDevices(hash);
        devices.map(d => d.getSlot(slot).set(property, v));
    }
    and(register, a, b) {
        this.__op((a, b) => a && b, register, a, b);
    }
    or(register, a, b) {
        this.__op((a, b) => a || b, register, a, b);
    }
    xor(register, a, b) {
        this.__op((a, b) => a ^ b, register, a, b);
    }
    nor(register, a, b) {
        this.__op((a, b) => Number(!(a || b)), register, a, b);
    }
    _debug(...args) {
        this._log(...args);
    }
    _log(...args) {
        const out = [];
        try {
            for (const argumentsKey in args) {
                if (args.hasOwnProperty(argumentsKey)) {
                    let key = args[argumentsKey];
                    try {
                        const value = this.memory.findValue(key);
                        if (value !== undefined) {
                            out.push(`${key} = ${value};`);
                            break;
                        }
                    }
                    catch {
                    }
                    let keys = key.split('.');
                    try {
                        let environ = Object.keys(this.memory.environ);
                        if (environ.indexOf(keys[0]) >= 0) {
                            if (keys[0] == key) {
                                out.push(`${key} = ${JSON.stringify(this.memory.environ.get(key).properties)};`);
                                continue;
                            }
                            switch (keys.length) {
                                case 2:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0]).get(keys[1])};`);
                                    break;
                                case 3:
                                    out.push(`${key} = ${JSON.stringify(this.memory.environ.get(keys[0]).getSlot(Number(keys[1])))};`);
                                    break;
                                case 4:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0]).getSlot(Number(keys[2]), keys[3])};`);
                                    break;
                            }
                            continue;
                        }
                        out.push(`${key};`);
                    }
                    catch (e) {
                        out.push(key + ' ' + e.message + '; ');
                    }
                }
            }
            this.settings.logCallback.call(this, `Log[${this.position}]: `, out);
        }
        catch (e) {
            console.debug(e);
        }
    }
    _d0(op1) {
        this.__d('d0', arguments);
    }
    _d1(op1) {
        this.__d('d1', arguments);
    }
    _d2(op1) {
        this.__d('d2', arguments);
    }
    _d3(op1) {
        this.__d('d3', arguments);
    }
    _d4(op1) {
        this.__d('d4', arguments);
    }
    _d5(op1) {
        this.__d('d5', arguments);
    }
    __d(device, args) {
        const d = this.memory.getDevice(device);
        switch (Object.keys(args).length) {
            case 0:
                throw exports.Execution.error(this.position, 'missing arguments');
            case 1:
                d.hash = args[0];
                break;
            case 2:
                d.set(args[0], args[1]);
                break;
            case 3:
                d.setSlot(args[0], args[1], args[2]);
        }
    }
    __debug(p, iArguments) {
        if (this.settings.debug) {
            this.settings.debugCallback.call(this, ...arguments);
        }
    }
}
exports.InterpreterIc10 = InterpreterIc10;
exports.default = InterpreterIc10;
//# sourceMappingURL=main.js.map