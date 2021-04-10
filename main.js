"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpreterIc10 = exports.Slot = exports.Chip = exports.Device = exports.ConstantCell = exports.MemoryStack = exports.MemoryCell = exports.Memory = exports.Environ = exports.ic10Error = void 0;
const caller_id_1 = __importDefault(require("caller-id"));
const chalk_1 = __importDefault(require("chalk"));
const regexes = {
    'rr1': new RegExp("[rd]{1,}(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    'r1': new RegExp("^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$"),
    'd1': new RegExp("^d(0|1|2|3|4|5|b)$"),
    'rr': new RegExp("^d(0|1|2|3|4|5|b)$"),
    'strStart': new RegExp("^\".+$"),
    'strEnd': new RegExp(".+\"$"),
};
class ic10Error {
    constructor(caller, code, message, obj, lvl = 0) {
        this.message = message;
        this.code = code;
        this.obj = obj;
        this.lvl = lvl;
        this.className = caller?.typeName ?? '';
        this.functionName = caller?.functionName ?? caller?.methodName ?? '';
        this.line = caller?.lineNumber ?? 0;
    }
    getCode() {
        return this.code;
    }
    getMessage() {
        return this.message;
    }
}
exports.ic10Error = ic10Error;
var Execution = {
    error(code, message, obj = null) {
        var caller = caller_id_1.default.getData();
        return new ic10Error(caller, code, message, obj, 0);
    },
    display: function (e) {
        if (e instanceof ic10Error) {
            var string = `[${e.functionName}:${e.line}] (${e.code}) - ${e.message}:`;
            switch (e.lvl) {
                case 0:
                    console.error(chalk_1.default.red('ERROR ' + string), e.obj);
                    break;
                case 1:
                    console.warn(chalk_1.default.yellow('WARN ' + string), e.obj);
                    break;
                case 2:
                    console.info(chalk_1.default.blue('INFO ' + string), e.obj);
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
class Environ {
    constructor(scope) {
        this.#scope = scope;
        this.d0 = new Device(scope, 'd0');
        this.d1 = new Device(scope, 'd1');
        this.d2 = new Device(scope, 'd2');
        this.d3 = new Device(scope, 'd3');
        this.d4 = new Device(scope, 'd4');
        this.d5 = new Device(scope, 'd5');
        this.db = new Chip(scope, 'db');
    }
    #scope;
    randomize() {
        for (const x in this) {
            if (this[x] instanceof Device) {
                this[x].randomize();
            }
        }
    }
}
exports.Environ = Environ;
class Memory {
    constructor(scope) {
        this.#scope = scope;
        this.cells = new Array(15);
        this.environ = new Environ(scope);
        this.aliases = new Object();
        for (let i = 0; i < 18; i++) {
            if (i === 16) {
                this.cells[i] = new MemoryStack(scope, 'r' + i);
            }
            else {
                this.cells[i] = new MemoryCell(scope, 'r' + i);
            }
        }
    }
    get scope() {
        return null;
    }
    #scope;
    cell(cell, op1 = null, op2 = null) {
        if (typeof cell === "string") {
            if (cell == 'sp')
                cell = 'r16';
            if (cell == 'ra')
                cell = 'r17';
            if (regexes.rr1.test(cell)) {
                let m = regexes.rr1.exec(cell);
                let m1 = this.cell(cell.replace(m[1], this.cell(m[1])), op1, op2) ?? false;
                if (m1 !== false) {
                    return m1;
                }
                throw Execution.error(this.#scope.position, 'Unknown cell', m1);
            }
            if (regexes.r1.test(cell)) {
                let m = regexes.r1.exec(cell);
                if (m[1] in this.cells) {
                    if (op1 === null) {
                        return this.cells[m[1]].get();
                    }
                    else {
                        return this.cells[m[1]].set(this.cell(op1));
                    }
                }
                else {
                    throw Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (regexes.d1.test(cell)) {
                if (cell in this.environ) {
                    if (op1 === null) {
                        throw Execution.error(this.#scope.position, 'Have not `Port`', cell);
                    }
                    else {
                        if (op1 !== null) {
                            return this.environ[cell].set(op1, this.cell(op2));
                        }
                        return this.environ[cell].get(op1);
                    }
                }
                else {
                    throw Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (cell in this.aliases) {
                if (this.aliases[cell] instanceof MemoryCell) {
                    if (op1 === null) {
                        return this.aliases[cell].get();
                    }
                    else {
                        return this.aliases[cell].set(this.cell(op1));
                    }
                }
                else if (this.aliases[cell] instanceof Device) {
                    if (op1 === null) {
                        throw Execution.error(this.#scope.position, 'Have not `Port`', cell);
                    }
                    else {
                        if (op2 !== null) {
                            return this.aliases[cell].set(op1, this.cell(op2));
                        }
                        return this.aliases[cell].get(op1);
                    }
                }
                else if (this.aliases[cell] instanceof ConstantCell) {
                    return this.aliases[cell].get();
                }
                else {
                    throw Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            throw Execution.error(this.#scope.position, 'Unknown cell', cell);
        }
        if (typeof cell === "number") {
            return cell;
        }
    }
    getCell(cell) {
        if (typeof cell === "string") {
            if (cell == 'sp')
                cell = 'r16';
            if (cell == 'ra')
                cell = 'r17';
            if (regexes.rr1.test(cell)) {
                let m = regexes.rr1.exec(cell);
                let m1 = this.getCell(cell.replace(m[1], this.cell(m[1]))) ?? false;
                if (m1 !== false) {
                    return m1;
                }
                throw Execution.error(this.#scope.position, 'Unknown cell', m1);
            }
            if (regexes.r1.test(cell)) {
                let m = regexes.r1.exec(cell);
                if (m[1] in this.cells) {
                    return this.cells[m[1]];
                }
            }
            if (regexes.d1.test(cell)) {
                if (cell in this.environ) {
                    return this.environ[cell];
                }
                else {
                    throw Execution.error(this.#scope.position, 'Unknown cell', cell);
                }
            }
            if (cell in this.aliases) {
                return this.aliases[cell];
            }
            throw Execution.error(this.#scope.position, 'Unknown cell', cell);
        }
        if (typeof cell === "number") {
            if (cell >= 18)
                throw Execution.error(this.#scope.position, 'Unknown cell', cell);
            return this.cells[cell];
        }
    }
    alias(name, link) {
        this.aliases[name] = this.getCell(link);
        if (this.aliases[name] instanceof MemoryCell) {
            this.aliases[name].alias = name;
        }
        return this;
    }
    define(name, value) {
        this.aliases[name] = new ConstantCell(value);
    }
}
exports.Memory = Memory;
class MemoryCell {
    constructor(scope, name) {
        this.#scope = scope;
        this.name = name;
        this.alias = null;
        this.value = null;
    }
    #scope;
    getName() {
        return this.alias || this.name;
    }
    get(_ = null) {
        return this.value;
    }
    set(value, _ = null) {
        this.value = value;
        return this;
    }
}
exports.MemoryCell = MemoryCell;
class MemoryStack extends MemoryCell {
    constructor(scope, name) {
        super(scope, name);
        this.value = [];
    }
    #scope;
    push(value) {
        this.value.push(value);
        return this;
    }
    pop() {
        return this.value.pop();
    }
    peek() {
        return this.value[this.value.length - 1];
    }
    get() {
        return this.value;
    }
    set(value = null) {
        if (value) {
            this.push(value);
        }
        return this;
    }
}
exports.MemoryStack = MemoryStack;
class ConstantCell {
    constructor(value) {
        this.value = value;
    }
    get() {
        return this.value;
    }
}
exports.ConstantCell = ConstantCell;
class Device extends MemoryCell {
    constructor(scope, name) {
        super(scope, name);
        this.#scope = scope;
        this.On = 0;
        this.Power = 0;
        this.Error = 0;
        this.Activate = 0;
        this.Setting = null;
        this.RequiredPower = 0;
        this.ClearMemory = 0;
        this.Lock = 0;
        this.slots = new Array(5);
        this.RecipeHash = -128473777;
        this.Flour = 0;
        this.Fenoxitone = 0;
        this.Milk = 0;
        this.Egg = 0;
        this.Iron = 0;
        this.Gold = 0;
        this.Carbon = 0;
        this.Uranium = 0;
        this.Copper = 0;
        this.Steel = 0;
        this.Hydrocarbon = 0;
        this.Silver = 0;
        this.Nickel = 0;
        this.Lead = 0;
        this.Electrum = 0;
        this.Invar = 0;
        this.Constantan = 0;
        this.Solder = 0;
        this.Plastic = 0;
        this.Silicon = 0;
        this.Salicylic = 0;
        this.Alcohol = 0;
        this.Oil = 0;
        this.Potato = 0;
        this.Tomato = 0;
        this.Rice = 0;
        this.Pumpkin = 0;
        this.Yellow = 0;
        this.Red = 0;
        this.Orange = 0;
        this.Green = 0;
        this.Blue = 0;
        this.AirRelease = 0;
        this.Charge = 0;
        this.Color = 0;
        this.CompletionRatio = 0;
        this.ElevatorLevel = 0;
        this.ElevatorSpeed = 0;
        this.ExportCount = 0;
        this.Filtration = 0;
        this.Harvest = 0;
        this.Horizontal = 0;
        this.HorizontalRatio = 0;
        this.Idle = 0;
        this.ImportCount = 0;
        this.Maximum = 0;
        this.Mode = 0;
        this.Open = 0;
        this.Output = 0;
        this.Plant = 0;
        this.PositionX = 0;
        this.PositionY = 0;
        this.PositionZ = 0;
        this.PowerActual = 0;
        this.PowerGeneration = 0;
        this.PowerPotential = 0;
        this.PowerRequired = 0;
        this.Pressure = 0;
        this.PressureExternal = 0;
        this.PressureInteral = 0;
        this.PressureSetting = 0;
        this.Quantity = 0;
        this.Ratio = 0;
        this.RatioCarbonDioxide = 0;
        this.RatioNitrogen = 0;
        this.RatioOxygen = 0;
        this.RatioPollutant = 0;
        this.RatioVolatiles = 0;
        this.RatioWater = 0;
        this.Reagents = 0;
        this.RequestHash = 0;
        this.SolarAngle = 0;
        this.Temperature = 0;
        this.TemperatureExternal = 0;
        this.TemperatureSettings = 0;
        this.TotalMoles = 0;
        this.VelocityMagnitude = 0;
        this.VelocityRelativeX = 0;
        this.VelocityRelativeY = 0;
        this.VelocityRelativeZ = 0;
        this.Vertical = 0;
        this.VerticalRatio = 0;
        this.Volume = 0;
        this.Occupied = 0;
        this.OccupantHash = 0;
        this.Damage = 0;
        this.Efficiency = 0;
        this.Health = 0;
        this.Growth = 0;
        this.ChargeRatio = 0;
        this.Class = 0;
        this.PressureWaste = 0;
        this.PressureAir = 0;
        this.MaxQuantity = 0;
        this.Mature = 0;
        this.ForceWrite = 0;
        this.randomize();
        for (let i = 0; i < 5; i++) {
            if (i === 16) {
                this.slots[i] = new Slot(scope);
            }
            else {
                this.slots[i] = new Slot(scope);
            }
        }
    }
    get scope() {
        return null;
    }
    #scope;
    randomize() {
        this.On = Math.round(Math.random());
        this.Power = Math.round(Math.random());
        this.Error = Math.round(Math.random());
        this.Activate = Math.round(Math.random());
        this.ClearMemory = 0;
        this.Flour = Math.abs(Math.round(Math.random() * 100));
        this.Fenoxitone = Math.abs(Math.round(Math.random() * 100));
        this.Milk = Math.abs(Math.round(Math.random() * 100));
        this.Egg = Math.abs(Math.round(Math.random() * 100));
        this.Iron = Math.abs(Math.round(Math.random() * 100));
        this.Gold = Math.abs(Math.round(Math.random() * 100));
        this.Carbon = Math.abs(Math.round(Math.random() * 100));
        this.Uranium = Math.abs(Math.round(Math.random() * 100));
        this.Copper = Math.abs(Math.round(Math.random() * 100));
        this.Steel = Math.abs(Math.round(Math.random() * 100));
        this.Hydrocarbon = Math.abs(Math.round(Math.random() * 100));
        this.Silver = Math.abs(Math.round(Math.random() * 100));
        this.Nickel = Math.abs(Math.round(Math.random() * 100));
        this.Lead = Math.abs(Math.round(Math.random() * 100));
        this.Electrum = Math.abs(Math.round(Math.random() * 100));
        this.Invar = Math.abs(Math.round(Math.random() * 100));
        this.Constantan = Math.abs(Math.round(Math.random() * 100));
        this.Solder = Math.abs(Math.round(Math.random() * 100));
        this.Plastic = Math.abs(Math.round(Math.random() * 100));
        this.Silicon = Math.abs(Math.round(Math.random() * 100));
        this.Salicylic = Math.abs(Math.round(Math.random() * 100));
        this.Alcohol = Math.abs(Math.round(Math.random() * 100));
        this.Oil = Math.abs(Math.round(Math.random() * 100));
        this.Potato = Math.abs(Math.round(Math.random() * 100));
        this.Tomato = Math.abs(Math.round(Math.random() * 100));
        this.Rice = Math.abs(Math.round(Math.random() * 100));
        this.Pumpkin = Math.abs(Math.round(Math.random() * 100));
        this.Yellow = Math.abs(Math.round(Math.random() * 100));
        this.Red = Math.abs(Math.round(Math.random() * 100));
        this.Orange = Math.abs(Math.round(Math.random() * 100));
        this.Green = Math.abs(Math.round(Math.random() * 100));
        this.Blue = Math.abs(Math.round(Math.random() * 100));
    }
    get(variable = null) {
        if (!variable) {
            return this;
        }
        if (variable in this) {
            return this[variable];
        }
        else {
            throw Execution.error(this.#scope.position, 'Unknown variable', variable);
        }
    }
    set(variable, value) {
        if (variable in this) {
            this[variable] = value;
        }
        else {
            throw Execution.error(this.#scope.position, 'Unknown variable', variable);
        }
        return this;
    }
    getSlot(op1, op2) {
        if (op1 in this.slots) {
            return this.slots[op1].get(op2);
        }
        else {
            throw Execution.error(this.#scope.position, 'Unknown Slot', op1);
        }
    }
}
exports.Device = Device;
class Chip extends Device {
    constructor(scope, name) {
        super(scope, name);
        this.#scope = scope;
        this.slots[1].OccupantHash = -744098481;
    }
    #scope;
}
exports.Chip = Chip;
class Slot {
    constructor(scope) {
        this.#scope = scope;
        this.Occupied = 1;
        this.OccupantHash = 0;
        this.Quantity = 0;
        this.Damage = 0;
        this.Class = 0;
        this.MaxQuantity = 1;
        this.PrefabHash = 0;
    }
    get scope() {
        return null;
    }
    #scope;
    get(op1) {
        if (op1 in this) {
            return this[op1];
        }
        else {
            throw Execution.error(this.#scope.position, 'Unknown parameter', op1);
        }
    }
}
exports.Slot = Slot;
class InterpreterIc10 {
    constructor(code = '', settings = {}) {
        this.code = code;
        this.memory = new Memory(this);
        this.constants = {};
        this.labels = {};
        this.settings = Object.assign({
            debug: true,
            tickTime: 100,
            debugCallback: (a, b) => {
                console.log(...arguments);
                this.output.debug = a + ' ' + JSON.stringify(b);
            },
            logCallback: (a, b) => {
                console.log(...arguments);
                this.output.log = a + ' ' + b;
            },
            executionCallback: (e) => {
                this.output.error = Execution.display(e);
            },
        }, settings);
        this.memory.environ.randomize();
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
    init(text) {
        this.lines = text.split(/\r?\n/);
        var commands = this.lines
            .map((line) => {
            const args = line.trim().split(/ +/);
            const command = args.shift();
            return { command, args };
        });
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey];
                var newArgs = {};
                var mode = 0;
                var argNumber = 0;
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey];
                        if (arg.startsWith("#")) {
                            break;
                        }
                        if (mode === 0) {
                            argNumber++;
                        }
                        if (regexes.strStart.test(arg)) {
                            mode = 1;
                        }
                        if (argNumber in newArgs) {
                            newArgs[argNumber] += ' ' + arg;
                        }
                        else {
                            newArgs[argNumber] = arg;
                        }
                        if (regexes.strEnd.test(arg)) {
                            mode = 0;
                        }
                    }
                }
                commands[commandsKey].args = Object.values(newArgs);
            }
            else {
                commands.push({ command: '', args: [] });
            }
        }
        this.commands = commands;
        this.position = 0;
        while (this.position < this.commands.length) {
            let { command, args } = this.commands[this.position];
            this.position++;
            if (command.match(/^\w+:$/)) {
                this.labels[command.replace(":", "")] = this.position;
            }
        }
        this.position = 0;
        return this;
    }
    stop() {
        clearInterval(this.interval);
        return this;
    }
    run() {
        this.interval = setInterval(() => {
            var why = this.prepareLine();
            if (why !== true) {
                this.settings.debugCallback.call(this, why, []);
                clearInterval(this.interval);
            }
        }, this.settings.tickTime);
        return this;
    }
    prepareLine(line = -1) {
        if (line > 0) {
            this.position = line;
        }
        this.memory.environ.randomize();
        if (!(this.position in this.commands)) {
            return 'end';
        }
        let { command, args } = this.commands[this.position];
        this.position++;
        let isComment = true;
        if (command != '' && !command.trim().endsWith(":")) {
            isComment = command.startsWith("#");
            for (const argsKey in args) {
                let a = parseFloat(args[argsKey]);
                if (!isNaN(a)) {
                    args[argsKey] = a;
                }
            }
            try {
                if (command === "#die")
                    return 'die';
                command = command.replace("#", "_");
                if (command in this) {
                    this[command](...args);
                    this.__debug(command, args);
                }
                else if (!isComment) {
                    throw Execution.error(this.position, 'Undefined function', command);
                }
            }
            catch (e) {
                this.settings.executionCallback.call(this, e);
            }
        }
        if (command === "hcf")
            return 'hcf';
        return isComment && this.position < this.commands.length
            ? this.prepareLine()
            : this.position < this.commands.length ? true : 'end';
    }
    __issetLabel(x) {
        return x in this.labels;
    }
    define(op1, op2, op3, op4) {
        this.memory.define(op1, op2);
    }
    alias(op1, op2, op3, op4) {
        this.memory.alias(op1, op2);
    }
    l(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2, op3));
    }
    ls(op1, op2, op3, op4) {
        var d = this.memory.getCell(op2);
        if (d instanceof Device) {
            this.memory.cell(op1, d.getSlot(this.memory.cell(op3), op4));
        }
        else {
            throw Execution.error(this.position, 'Unknown Device', op2);
        }
    }
    s(op1, op2, op3, op4) {
        this.memory.cell(op1, op2, op3);
    }
    move(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2));
    }
    add(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2) + this.memory.cell(op3));
    }
    sub(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2) - this.memory.cell(op3));
    }
    mul(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2) * this.memory.cell(op3));
    }
    div(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2) / this.memory.cell(op3));
    }
    mod(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.abs(this.memory.cell(op2) % this.memory.cell(op3)));
    }
    sqrt(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.sqrt(this.memory.cell(op2)));
    }
    round(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.round(this.memory.cell(op2)));
    }
    trunc(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.trunc(this.memory.cell(op2)));
    }
    ceil(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.ceil(this.memory.cell(op2)));
    }
    floor(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.floor(this.memory.cell(op2)));
    }
    max(op1, op2, op3, op4) {
        if (op3 > op2) {
            this.memory.cell(op1, this.memory.cell(op3));
        }
        else {
            this.memory.cell(op1, this.memory.cell(op2));
        }
    }
    min(op1, op2, op3, op4) {
        if (op2 > op3) {
            this.memory.cell(op1, this.memory.cell(op3));
        }
        else {
            this.memory.cell(op1, this.memory.cell(op2));
        }
    }
    abs(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.abs(this.memory.cell(op2)));
    }
    log(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.log(this.memory.cell(op2)));
    }
    exp(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.exp(this.memory.cell(op2)));
    }
    rand(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.random());
    }
    sin(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.sin(op2));
    }
    cos(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.cos(op2));
    }
    tan(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.tan(op2));
    }
    asin(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.asin(op2));
    }
    acos(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.acos(op2));
    }
    atan(op1, op2, op3, op4) {
        this.memory.cell(op1, Math.atan(op2));
    }
    yield(op1, op2, op3, op4) {
    }
    sleep(op1, op2, op3, op4) {
    }
    select(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.cell(op2 ? op3 : op4));
    }
    hcf(op1, op2, op3, op4) {
        console.log(chalk_1.default.red("Die Mother Fucker Die Mother Fucker Die !!!!!"));
    }
    j(op1) {
        if (this.__issetLabel(op1)) {
            this.position = this.labels[op1] + 1;
        }
        else {
            throw Execution.error(this.position, ' Undefined label', op1);
        }
    }
    jr(op1) {
        this.position += op1 + 1;
    }
    jal(op1) {
        this.j(op1);
        this.memory.cell('r17', this.position + 1);
    }
    __eq(op1 = 0, op2 = 0) {
        return Number(op1 == op2);
    }
    __ge(op1 = 0, op2 = 0) {
        return Number(op1 >= op2);
    }
    __gt(op1 = 0, op2 = 0) {
        return Number(op1 > op2);
    }
    __le(op1 = 0, op2 = 0) {
        return Number(op1 <= op2);
    }
    __lt(op1 = 0, op2 = 0) {
        return Number(op1 < op2);
    }
    __ne(op1 = 0, op2 = 0) {
        return Number(op1 != op2);
    }
    __ap(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
        return Number(!this.__na(...arguments));
    }
    __na(x = 0, y = 0, d = 0, op4 = 0) {
        if (y == 0) {
            return Number(d > 0);
        }
        return Number(Math.abs(x - y) > d * Math.max(Math.abs(x), Math.abs(y)));
    }
    __dse(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
        return 1;
    }
    __dns(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
        return 0;
    }
    seq(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__eq(this.memory.cell(op2), this.memory.cell(op3)));
    }
    seqz(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__eq(this.memory.cell(op2), 0));
    }
    sge(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ge(this.memory.cell(op2), this.memory.cell(op3)));
    }
    sgez(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ge(this.memory.cell(op2), 0));
    }
    sgt(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__gt(this.memory.cell(op2), this.memory.cell(op3)));
    }
    sgtz(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__gt(this.memory.cell(op2), 0));
    }
    sle(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__le(this.memory.cell(op2), this.memory.cell(op3)));
    }
    slez(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__le(this.memory.cell(op2), 0));
    }
    slt(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__lt(this.memory.cell(op2), this.memory.cell(op3)));
    }
    sltz(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__lt(this.memory.cell(op2), 0));
    }
    sne(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ne(this.memory.cell(op2), this.memory.cell(op3)));
    }
    snez(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ne(this.memory.cell(op2), 0));
    }
    sap(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ap(this.memory.cell(op2), this.memory.cell(op3)));
    }
    sapz(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__ap(this.memory.cell(op2), 0));
    }
    sna(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__na(this.memory.cell(op2), this.memory.cell(op3), this.memory.cell(op4)));
    }
    snaz(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__na(this.memory.cell(op2), 0, this.memory.cell(op3)));
    }
    sdse(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__dse(this.memory.cell(op2), this.memory.cell(op3)));
    }
    sdns(op1, op2, op3, op4) {
        this.memory.cell(op1, this.__dns(this.memory.cell(op2), this.memory.cell(op3)));
    }
    beq(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    beqz(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    bge(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bgez(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    bgt(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bgtz(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    ble(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    blez(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    blt(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bltz(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    bne(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bnez(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), 0)) {
            this.j(op3);
        }
    }
    bap(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.j(op4);
        }
    }
    bapz(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), 0, this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bna(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.j(op4);
        }
    }
    bnaz(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bdse(op1, op2, op3, op4) {
        if (this.__dse(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    bdns(op1, op2, op3, op4) {
        if (this.__dns(this.memory.cell(op1), this.memory.cell(op2))) {
            this.j(op3);
        }
    }
    breq(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    breqz(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brge(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brgez(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brgt(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brgtz(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brle(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brlez(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brlt(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brltz(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brne(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brnez(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), 0)) {
            this.jr(op3);
        }
    }
    brap(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.jr(op4);
        }
    }
    brapz(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), 0, this.memory.cell(op2))) {
            this.jr(op4);
        }
    }
    brna(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.jr(op4);
        }
    }
    brnaz(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brdse(op1, op2, op3, op4) {
        if (this.__dse(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    brdns(op1, op2, op3, op4) {
        if (this.__dns(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jr(op3);
        }
    }
    beqal(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    beqzal(op1, op2, op3, op4) {
        if (this.__eq(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bgeal(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bgezal(op1, op2, op3, op4) {
        if (this.__ge(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bgtal(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bgtzal(op1, op2, op3, op4) {
        if (this.__gt(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bleal(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    blezal(op1, op2, op3, op4) {
        if (this.__le(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bltal(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bltzal(op1, op2, op3, op4) {
        if (this.__lt(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bneal(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bnezal(op1, op2, op3, op4) {
        if (this.__ne(this.memory.cell(op1), 0)) {
            this.jal(op3);
        }
    }
    bapal(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.jal(op4);
        }
    }
    bapzal(op1, op2, op3, op4) {
        if (this.__ap(this.memory.cell(op1), 0), this.memory.cell(op2)) {
            this.jal(op3);
        }
    }
    bnaal(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
            this.jal(op4);
        }
    }
    bnazal(op1, op2, op3, op4) {
        if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bdseal(op1, op2, op3, op4) {
        if (this.__dse(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    bdnsal(op1, op2, op3, op4) {
        if (this.__dns(this.memory.cell(op1), this.memory.cell(op2))) {
            this.jal(op3);
        }
    }
    push(op1, op2, op3, op4) {
        this.memory.getCell('r16').push(op1);
    }
    pop(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.getCell('r16').pop());
    }
    peek(op1, op2, op3, op4) {
        this.memory.cell(op1, this.memory.getCell('r16').peek());
    }
    _log() {
        var out = [];
        for (const argumentsKey in arguments) {
            try {
                out.push(this.memory.cell(arguments[argumentsKey]));
            }
            catch (e) {
                try {
                    out.push(this.memory.getCell(arguments[argumentsKey]));
                }
                catch (e) {
                    out.push(arguments[argumentsKey]);
                }
            }
        }
        this.settings.logCallback.call(this, `Log [${this.position}]: `, ...out);
    }
    __debug(p, iArguments) {
        if (this.settings.debug) {
            this.settings.debugCallback.call(this, ...arguments);
        }
    }
}
exports.InterpreterIc10 = InterpreterIc10;
//# sourceMappingURL=main.js.map