import {Ic10DiagnosticError, Ic10Error} from "./Ic10Error";
import {Memory} from "./Memory";
import {Device, IcHash} from "./Device";
import {Slot} from "./Slot";
import {isChannel, isConst, isDeviceParameter, isSlotParameter} from "./icTypes";

const regexes = {
    strStart: new RegExp("^\".+$"),
    strEnd: new RegExp(".+\"$"),
}

const modes = {
    Average: 0,
    Sum: 1,
    Minimum: 2,
    Maximum: 3
} as const

export type ReturnCode = "hcf" | "end" | "die"

export const Execution = {
    display: function (e: Ic10Error | any) {
        if (e instanceof Ic10Error) {
            const string = `(${e.line}) - ${e.message}:`;
            switch (e.lvl) {
                case 0:
                    console.error('ERROR ' + string, e.obj)
                    break;
                case 1:
                    console.warn('WARN ' + string, e.obj)
                    break;
                case 2:
                    console.info('INFO ' + string, e.obj)
                    break;
                case 3:
                default:
                    console.log('LOG ' + string, e.obj)
                    break;
            }
            return string
        }

        console.log(e)
        return e;
    }
}

export type InterpreterIc10Settings = {
    debug: boolean;
    debugCallback: Function;
    logCallback: (s:string,out:string[] )=>void;
    executionCallback: (err: Ic10Error) => void;
    tickTime: number;
}

// noinspection SpellCheckingInspection
export class InterpreterIc10 {
    public code: string
    public commands: { command: string | undefined, args: string[] }[] = []
    public lines: string[] = []
    public memory: Memory
    public position: number = 0
    public interval: any
    public labels: { [key: string]: number } = {}
    public constants: {}
    public output: {
        debug: string,
        log: string,
        error: string,
    }
    public settings: InterpreterIc10Settings;
    public ignoreLine: Array<number>;
    public device?: Device

    constructor(code: string = '', settings: Partial<InterpreterIc10Settings> = {}) {
        this.code = code
        this.memory = new Memory(this)
        this.constants = {}
        this.labels = {}
        this.ignoreLine = []
        this.settings = Object.assign({
            debug: true,
            tickTime: 100,
            debugCallback: (a: string, b: any) => {
                this.output.debug = a + ' ' + JSON.stringify(b)
            },
            logCallback: (a: string, b: any[]) => {
                this.output.log = a + ' ' + b.join('')
            },
            executionCallback: (e: Ic10Error) => {
                this.output.error = <string>Execution.display(e)
            },
        }, settings)
        if (code) {
            this.init(code)
        }
        this.output = {
            debug: '',
            log: '',
            error: '',
        }
    }

    setSettings(settings: Partial<InterpreterIc10Settings> = {}): InterpreterIc10 {
        this.settings = Object.assign(this.settings, settings)
        return this;
    }

    init(text: string, device?: Device): InterpreterIc10 {
        this.memory.reset()
        if (device !== undefined) {
            const ics = device.slots
                .filter(s => s.has("OccupantHash") && s.get("OccupantHash") === IcHash)

            if (ics.length === 1) {
                this.device = device
                this.memory.environ.db = device
            }
        }

        this.lines = text.split(/\r?\n/);
        const commands = this.lines
            .map((line: string) => {
                const args = line.trim().split(/ +/)
                const command = args.shift()
                return {command, args}
            });
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey]
                const newArgs: Record<string, string> = {};
                let mode = 0;
                let argNumber = 0;
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey]
                        if (arg.startsWith("#"))
                            break;

                        if (mode === 0)
                            argNumber++

                        if (regexes.strStart.test(arg))
                            mode = 1

                        if (argNumber in newArgs)
                            newArgs[argNumber] += ' ' + arg
                        else
                            newArgs[argNumber] = arg

                        if (regexes.strEnd.test(arg))
                            mode = 0
                    }
                }
                commands[commandsKey].args = Object.values(newArgs)
            } else
                commands.push({command: '', args: []})
        }
        this.commands = commands
        this.position = 0
        while (this.position < this.commands.length) {
            let {command, args} = this.commands[this.position]
            this.position++
            if (command?.match(/^\w+:$/)) {
                let label = command.replace(":", "")
                // @ts-ignore
                this.labels[command.replace(":", "")] = this.position
                this.memory.define(label, this.position)
            }
        }
        this.position = 0
        this.__updateDevice()
        return this
    }

    __updateDevice() {
        if (this.device === undefined)
            return

        if (this.device.has("LineNumber"))
            this.device.set("LineNumber", this.position)

        this.device.slots.forEach(slot => {
            if (slot.has("LineNumber"))
                slot.set("LineNumber", this.position)
        })
    }

    stop(): InterpreterIc10 {
        clearInterval(this.interval)
        return this;
    }

    async run() {
        return new Promise((resolve) => {
            this.interval = setInterval(() => {
                const why = this.prepareLine();
                if (why !== true) {
                    this.settings.debugCallback.call(this, why, [])
                    clearInterval(this.interval)
                }
            }, this.settings.tickTime)
            resolve(this)
        })
    }

    prepareLine(line = -1, isDebugger = false): ReturnCode | true {
        if (line === 0) {
            this.memory.environ.db.properties.Error = 0// why not :)
        }
        if (line >= 0) {
            this.position = line;
        }
        if (!(this.position in this.commands)) {
            return 'end';
        }
        let {command, args} = this.commands[this.position]
        this.position++
        let isComment = true
        if (command && command != '' && !command.trim().endsWith(":")) {
            isComment = command.startsWith("#")
            for (const argsKey in args) {
                let a = parseFloat(args[argsKey])
                if (!isNaN(a)) {
                    args[argsKey] = String(a)
                }
            }
            try {
                if (command === "#die") return 'die'
                command = command.replace("#", "_")
                if (command in this) {
                    // @ts-ignore
                    this[command](...args)
                    this.__updateDevice()
                    this.__debug(command, args)
                } else if (!isComment)
                    throw new Ic10Error('Unknown function', command)
            } catch (e) {
                if (e instanceof Ic10Error) {
                    e.line = this.position
                }

                //mark as error for later executions
                this.memory.environ.db.properties.Error = 1
                if (e instanceof Ic10DiagnosticError || e instanceof Ic10Error)
                    this.settings.executionCallback.call(this, e)
                else
                    throw e
            }
        }
        if (command === "hcf")
            return 'hcf'

        if (isComment) {
            this.ignoreLine.push(this.position)
        }
        if (!isDebugger) {
            return isComment && this.position < this.commands.length
                ? this.prepareLine()
                : this.position < this.commands.length ? true : 'end'
        } else {
            return this.position < this.commands.length ? true : 'end'
        }
    }

    runUntilSync(cond: (status: true | ReturnCode) => boolean, maxIterations: number = 0) {
        let status: ReturnCode | true = true
        let n = 0;
        do {
            status = this.prepareLine()
            n++
        } while (!cond(status) && (maxIterations <= 0 || n <= maxIterations))

        return n
    }

    __issetLabel(x: string) {
        return x in this.labels
    }

    /*
    * @define@
    * [en] Set a name for the constant
    * [ru] Задать имя для константы
    */
    define(alias: string, value: number | string) {
        if (isChannel(alias.toLowerCase()) || isSlotParameter(alias.toLowerCase()) || isDeviceParameter(alias.toLowerCase()) || isConst(alias.toLowerCase())) {
            throw new Ic10DiagnosticError('Incorrect constant. Is system keyworld', alias)
        }
        this.memory.define(alias, value)
    }

    /*
    * @alias@
    * [en] Specify an alias for a register or data channel
    * [ru] Задат псевдоним для регистра или канала данных
    */
    alias(alias: string, target: string) {
        if (isChannel(alias.toLowerCase()) || isSlotParameter(alias.toLowerCase()) || isDeviceParameter(alias.toLowerCase()) || isConst(alias.toLowerCase())) {
            throw new Ic10DiagnosticError('Incorrect alias. Is system keyworld', alias)
        }
        this.memory.alias(alias, target)
    }

    __op<Args extends number[]>(op: (...args: Args) => number, register: string, ...args: { [K in keyof Args]: string }) {
        const r = this.memory.getRegister(register)

        const inputs = args.map(v => this.memory.getValue(v)) as Args

        r.value = op(...inputs)
    }

    /*
    * @move@
    * [en] Value assignment
    * [ru] Присвоение значения
    */
    move(register: string, value: string) {
        if (isChannel(register.toLowerCase()) || isSlotParameter(register.toLowerCase()) || isDeviceParameter(register.toLowerCase()) || isConst(register.toLowerCase())) {
            throw new Ic10DiagnosticError('Incorrect register. Is system keyworld', register)
        }
        if (isChannel(value.toLowerCase()) || isSlotParameter(value.toLowerCase()) || isDeviceParameter(value.toLowerCase()) || isConst(value.toLowerCase())) {
            throw new Ic10DiagnosticError('Incorrect value. Is system keyworld', value)
        }
        this.__op(v => v, register, value)
    }

    __move(register: string, value: string) {
        this.move(register, value)
    }

    /*
    * @add@
    * [en] Sum
    * [ru] Сумма
    */
    add(register: string, a: string, b: string) {
        this.__op((a, b) => a + b, register, a, b)
    }

    /*
    * @sub@
    * [en] Difference
    * [ru] Разность
    */
    sub(register: string, a: string, b: string) {
        this.__op((a, b) => a - b, register, a, b)
    }

    /*
    * @mul@
    * [en] Work
    * [ru] Произведение
    */
    mul(register: string, a: string, b: string) {
        this.__op((a, b) => a * b, register, a, b)
    }

    /*
    * @div@
    * [en] Division
    * [ru] Деление
    */
    div(register: string, a: string, b: string) {
        this.__op((a, b) => Number(a / b) || 0, register, a, b)
    }

    /*
    * @mod@
    * [en] Remainder of integer division of op2 by op3 (the result is not equivalent to the % operator, and will be positive for any signs of op2 and op3)
    * [ru] Остаток от целочисленного деления op2 на op3 (результат не эквивалентен оператору %, и будет положителен при любых знаках op2 и op3)
    */
    mod(register: string, a: string, b: string) {
        this.__op((a, b) => a % b, register, a, b)
    }

    /*
    * @sqrt@
    * [en] Square root
    * [ru] Квадратный корень
    */
    sqrt(register: string, v: string) {
        this.__op(Math.sqrt, register, v)
    }

    /*
    * @round@
    * [en] Rounding to nearest integer
    * [ru] Округление к ближайшему целому
    */
    round(register: string, v: string) {
        this.__op(Math.round, register, v)
    }

    /*
    * @trunc@
    * [en] The integer part of number
    * [ru] Целая часть числа
    */
    trunc(register: string, v: string) {
        this.__op(Math.trunc, register, v)
    }

    /*
    * @ceil@
    * [en] Round up to nearest integer
    * [ru] Округление до ближайшего целого вверх
    */
    ceil(register: string, v: string) {
        this.__op(Math.ceil, register, v)
    }

    /*
    * @floor@
    * [en] Rounding down to nearest integer
    * [ru] Округление до ближайшего целого вниз
    */
    floor(register: string, v: string) {
        this.__op(Math.floor, register, v)
    }

    /*
    * @max@
    * [en] Maximum of two
    * [ru] Максимальное из двух
    */
    max(register: string, a: string, b: string) {
        this.__op(Math.max, register, a, b)
    }

    /*
    * @minx@
    */
    minx(register: string, a: string, b: string) {
        this.__op(Math.min, register, a, b)
    }

    /*
    * @abs@
    * [en] The absolute value of the number
    * [ru] Абсолютная величина числа
    */
    abs(register: string, v: string) {
        this.__op(Math.abs, register, v)
    }

    /*
    * @log@
    * [en] natural logarithm
    * [ru] Натуральный логарифм
    */
    log(register: string, v: string) {
        this.__op(Math.log, register, v)
    }

    /*
    * @exp@
    * [en] Exhibitor
    * [ru] Экспонента
    */
    exp(register: string, v: string) {
        this.__op(Math.exp, register, v)
    }

    /*
    * @rand@
    * [en] Random value from 0 to 1 inclusive
    * [ru] Случайная величина от 0 до 1 включительно
    */
    rand(register: string, v: string) {
        this.__op(_ => Math.random(), register, v)
    }

    /*
    * @sin@
    * [en] Sinus*
    * [ru] Синус*
    */
    sin(register: string, v: string) {
        this.__op(Math.sin, register, v)
    }

    /*
    * @cos@
    * [en] Cosine*
    * [ru] Косинус*
    */
    cos(register: string, v: string) {
        this.__op(Math.cos, register, v)
    }

    /*
    * @tan@
    * [en] Tangent*
    * [ru] Тангенс*
    */
    tan(register: string, v: string) {
        this.__op(Math.tan, register, v)
    }

    /*
    * @asin@
    * [en] Arcsine*
    * [ru] Арксинус*
    */
    asin(register: string, v: string) {
        this.__op(Math.asin, register, v)
    }

    /*
    * @acos@
    * [en] Arccosine*
    * [ru] Арккосинус*
    */
    acos(register: string, v: string) {
        this.__op(Math.acos, register, v)
    }

    /*
    * @atan@
    * [en] Arctangent*
    * [ru] Арктангенс*
    */
    atan(register: string, v: string) {
        this.__op(Math.atan, register, v)
    }

    /*
    * @atan2@
    * [en] Arc tangent with 2 arguments
    * [ru] Арктангенс с 2 аргументами
    */
    atan2(register: string, a: string, b: string) {
        this.__op(Math.atan2, register, a, b)
    }

    /*
    * @yield@
    * [en] Pausing the program until the next tick
    * [ru] Приостановка программы до следующего тика
    */
    yield() {
    }

    /*
    * @sleep@
    * [en] Pause the program for op1 seconds
    * [ru] Приостановка программы на op1 секунд
    */
    sleep(s: number) {
        //TODO: yield for s * x ticks
    }

    /*
    * @select@
    * [en] Ternary select. If op2 is true then op1 := op3, otherwise op1 := op4
    * [ru] Тернарный select. Если op2 истинно, то op1 := op3, иначе op1 := op4
    */
    select(register: string, a: string, b: string, c: string) {
        this.__op((a, b, c) => a ? b : c, register, a, b, c)
    }

    /*
    * @hcf@
    * [en] Stop work and burn the microprocessor
    * [ru] Остановить работу и сжечь микропроцессор
    */
    hcf() {
        console.log("Die Mother Fucker Die!!!!!")
    }

    __jump(line: number) {
        this.position = line
    }

    __call(line: number) {
        this.memory.getRegister("ra").value = this.position
        this.__jump(line)
    }

    __getJumpTarget(target: string) {
        if (this.__issetLabel(target))
            return this.labels[target]

        const line = this.memory.getValue(target);

        if (isNaN(line))
            throw new Ic10DiagnosticError('Incorrect jump target', target)

        return line
    }

    /*
    * @j@
    * [en] Jump to the specified line
    * [ru] Переход на указанную строку
    */
    j(target: string) {
        this.__jump(this.__getJumpTarget(target))
    }

    /*
    * @jr@
    * [en] Relative jump to +op1
    * [ru] Относительный переход на +op1
    */
    jr(offset: string) {
        const d = this.memory.getValue(offset)

        if (Math.abs(d) < 0.001)
            throw new Ic10Error('Infinite loop detected caused by', offset)

        this.__jump(this.position + d - 1)
    }

    /*
    * @jal@
    * [en] Jump to op1, writing the address of the next line to ra
    * [ru] Переход на op1 с записью адреса следующей строки в ra
    */
    jal(target: string) {
        this.__call(this.__getJumpTarget(target))
    }

    __eq(a: number, b: number = 0) {
        return a == b
    }

    __ge(a: number, b: number = 0) {
        return a >= b
    }

    __gt(a: number, b: number = 0) {
        return a > b
    }

    __le(a: number, b: number = 0) {
        return a <= b
    }

    __lt(a: number, b: number = 0) {
        return a < b
    }

    __ne(a: number, b: number = 0) {
        return a != b
    }

    __ap(x: number, y: number, c: number = 0) {
        return !this.__na(x, y, c)
    }

    __na(x: number, y: number, c: number = 0) {
        return Math.abs(x - y) > c * Math.max(Math.abs(x), Math.abs(y))
    }

    __dse(d: string) {
        return this.memory.findDevice(d) !== undefined
    }

    __dns(d: string) {
        return !this.__dse(d)
    }

    __nan(v: number) {
        return isNaN(this.memory.getValue(v))
    }

    __nanz(v: number) {
        return !this.__nan(v)
    }

    __sOp<Args extends number[]>(op: (...args: Args) => boolean, register: string, ...args: { [K in keyof Args]: string }) {
        const r = this.memory.getRegister(register)

        const inputs = args.map(v => this.memory.getValue(v)) as Args

        r.value = op(...inputs) ? 1 : 0
    }

    /*
    * @seq@
    * [en] If op2 = op3, then one, otherwise zero
    * [ru] Если op2 = op3, то единица, иначе ноль
    */
    seq(register: string, a: string, b: string) {
        this.__sOp(this.__eq.bind(this), register, a, b)
    }

    /*
    * @seqz@
    * [en] If op2 = 0, then one, otherwise zero
    * [ru] Если op2 = 0, то единица, иначе ноль
    */
    seqz(register: string, a: string) {
        this.__sOp(this.__eq.bind(this), register, a)
    }

    /*
    * @sge@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    sge(register: string, a: string, b: string) {
        this.__sOp(this.__ge.bind(this), register, a, b)
    }

    /*
    * @sgez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    sgez(register: string, a: string) {
        this.__sOp(this.__ge.bind(this), register, a)
    }

    /*
    * @sgt@
    * [en] If op2 > op3, then one, otherwise zero
    * [ru] Если op2 > op3, то единица, иначе ноль
    */
    sgt(register: string, a: string, b: string) {
        this.__sOp(this.__gt.bind(this), register, a, b)
    }

    /*
    * @sgtz@
    * [en] If op2 > 0, then one, otherwise zero
    * [ru] Если op2 > 0, то единица, иначе ноль
    */
    sgtz(register: string, a: string) {
        this.__sOp(this.__gt.bind(this), register, a)
    }

    /*
    * @sle@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    sle(register: string, a: string, b: string) {
        this.__sOp(this.__le.bind(this), register, a, b)
    }

    /*
    * @slez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    slez(register: string, a: string) {
        this.__sOp(this.__le.bind(this), register, a)
    }

    /*
    * @slt@
    * [en] If op2 < op3, then one, otherwise zero
    * [ru] Если op2 < op3, то единица, иначе ноль
    */
    slt(register: string, a: string, b: string) {
        this.__sOp(this.__lt.bind(this), register, a, b)
    }

    /*
    * @sltz@
    * [en] If op2 < 0, then one, otherwise zero
    * [ru] Если op2 < 0, то единица, иначе ноль
    */
    sltz(register: string, a: string) {
        this.__sOp(this.__lt.bind(this), register, a)
    }

    /*
    * @sne@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    sne(register: string, a: string, b: string) {
        this.__sOp(this.__ne.bind(this), register, a, b)
    }

    /*
    * @snez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    snez(register: string, a: string) {
        this.__sOp(this.__ne.bind(this), register, a)
    }

    /*
    * @sap@
    * [en] If op2 op3 with precision op4, then one, otherwise zero
    * [ru] Если op2 op3 с точностью op4, то единица, иначе ноль
    */
    sap(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__ap.bind(this), register, x, y, c)
    }

    /*
    * @sapz@
    * [en] If op2 0 with precision op3, then one, otherwise zero
    * [ru] Если op2 0 с точностью op3, то единица, иначе ноль
    */
    sapz(register: string, x: string, y: string) {
        this.__sOp(this.__ap.bind(this), register, x, y)
    }

    /*
    * @sna@
    * [en] If op2 op3 with precision op4, then one, otherwise zero
    * [ru] Если op2 op3 с точностью op4, то единица, иначе ноль
    */
    sna(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__na.bind(this), register, x, y, c)
    }

    /*
    * @snaz@
    * [en] If op2 0 with precision op3, then one, otherwise zero
    * [ru] Если op2 0 с точностью op3, то единица, иначе ноль
    */
    snaz(register: string, x: string, y: string) {
        this.__sOp(this.__na.bind(this), register, x, y)
    }

    /*
    * @sdse@
    * [en] If channel op2 is set to one, otherwise zero
    * [ru] Если канал op2 настроен на то единица, иначе ноль
    */
    sdse(register: string, d: string) {
        this.memory.getRegister(register).value = Number(this.__dse(d))
    }

    /*
    * @sdns@
    * [en] If channel op2 is not set to one, otherwise zero
    * [ru] Если канал op2 не настроен на то единица, иначе ноль
    */
    sdns(register: string, d: string) {
        this.memory.getRegister(register).value = Number(this.__dns(d))
    }

    /*
    * @snan@
    * [en]
    * [ru] op1 равно 1, если op2 не имеет значения.
    */
    snan(register: string, v: string) {
        this.__sOp(this.__nan.bind(this), register, v)
    }

    /*
    * @snanz@
    * [en]
    * [ru] op1 равно 0, если op2 не имеет значения.
    */
    snanz(register: string, v: string) {
        this.__sOp(this.__nanz.bind(this), register, v)
    }

    __bOp<Args extends number[]>(op: (...args: Args) => boolean | undefined, line: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => this.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        this.j(line)
    }

    __bROp<Args extends number[]>(op: (...args: Args) => boolean | undefined, offset: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => this.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        this.jr(offset)
    }

    __bCOp<Args extends number[]>(op: (...args: Args) => boolean | undefined, line: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => this.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        this.jal(line)
    }

    /*
    * @beq@
    * [en] Jump to op3 if op1 = op2
    * [ru] Переход на op3, если op1 = op2
    */
    beq(a: string, b: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a, b)
    }

    /*
    * @beqz@
    * [en] Jump to op2 if op1 = 0
    * [ru] Переход на op2, если op1 = 0
    */
    beqz(a: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a)
    }

    /*
    * @bge@
    * [en] Jump to op3 if op1 >= op2
    * [ru] Переход на op3, если op1 >= op2
    */
    bge(a: string, b: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a, b)
    }

    /*
    * @bgez@
    * [en] Jump to op2 if op1 >= 0
    * [ru] Переход на op2, если op1 >= 0
    */
    bgez(a: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a)
    }

    /*
    * @bgt@
    * [en] Jump to op3 if op1 > op2
    * [ru] Переход на op3, если op1 > op2
    */
    bgt(a: string, b: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a, b)
    }

    /*
    * @bgtz@
    * [en] Jump to op2 if op1 > 0
    * [ru] Переход на op2, если op1 > 0
    */
    bgtz(a: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a)
    }

    /*
    * @ble@
    * [en] Jump to op3 if op1 <= op2
    * [ru] Переход на op3, если op1 <= op2
    */
    ble(a: string, b: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a, b)
    }

    /*
    * @blez@
    * [en] Jump to op2 if op1 <= 0
    * [ru] Переход на op2, если op1 <= 0
    */
    blez(a: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a)
    }

    /*
    * @blt@
    * [en] Jump to op3 if op1 < op2
    * [ru] Переход на op3, если op1 < op2
    */
    blt(a: string, b: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a, b)
    }

    /*
    * @bltz@
    * [en] Jump to op2 if op1 < 0
    * [ru] Переход на op2, если op1 < 0
    */
    bltz(a: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a)
    }

    /*
    * @bne@
    * [en] Jump to op3 if op1 != op2
    * [ru] Переход на op3, если op1 != op2
    */
    bne(a: string, b: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a, b)
    }

    /*
    * @bnez@
    * [en] Jump to op2 if op1 != 0
    * [ru] Переход на op2, если op1 != 0
    */
    bnez(a: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a)
    }

    /*
    * @bap@
    * [en] Jump to op4 if op1 op2 with precision op3
    * [ru] Переход на op4, если op1 op2 с точностью op3
    */
    bap(x: string, y: string, c: string, line: string) {
        this.__bOp(this.__ap.bind(this), line, x, y, c)
    }

    /*
    * @bapz@
    * [en] Jump to op3 if op1 0 with precision op2
    * [ru] Переход на op3, если op1 0 с точностью op2
    */
    bapz(x: string, y: string, line: string) {
        this.__bOp(this.__ap.bind(this), line, x, y)
    }

    /*
    * @bna@
    * [en] Jump to op4 if op1 ~= op2 with precision op3
    * [ru] Переход на op4, если op1 ~= op2 с точностью op3
    */
    bna(x: string, y: string, c: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y, c)
    }

    /*
    * @bnaz@
    * [en] Jump to op3 if op1 ~= 0 with precision op2
    * [ru] Переход на op3, если op1 ~= 0 с точностью op2
    */
    bnaz(x: string, y: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y)
    }

    /*
    * @bdse@
    * [en] Jump to op2 if channel op1 is configured
    * [ru] Переход на op2, если канал op1 настроен
    */
    bdse(d: string, line: string) {
        if (this.__dse(d))
            this.j(line)
    }

    /*
    * @bdns@
    * [en] Jump to op2 if op1 channel is not configured
    * [ru] Переход на op2, если канал op1 не настроен
    */
    bdns(d: string, line: string) {
        if (this.__dns(d))
            this.j(line)
    }

    /*
    * @bnan@
    * [en]
    * [ru] Переход на op2, если op1 = nan
    */
    bnan(v: string, line: string) {
        this.__bOp(this.__nan.bind(this), line, v)
    }

    /*
    * @breq@
    * [en] Relative jump to +op3 if op1 = op2
    * [ru] Относительный переход на +op3, если op1 = op2
    */
    breq(a: string, b: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a, b)
    }

    /*
    * @breqz@
    * [en] Relative jump to +op2 if op1 = 0
    * [ru] Относительный переход на +op2, если op1 = 0
    */
    breqz(a: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a)
    }

    /*
    * @brge@
    * [en] Relative jump to +op3 if op1 >= op2
    * [ru] Относительный переход на +op3, если op1 >= op2
    */
    brge(a: string, b: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
    }

    /*
    * @brgez@
    * [en] Relative jump to +op2 if op1 >= 0
    * [ru] Относительный переход на +op2, если op1 >= 0
    */
    brgez(a: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
    }

    /*
    * @brgt@
    * [en] Relative jump to +op3 if op1 > op2
    * [ru] Относительный переход на +op3, если op1 > op2
    */
    brgt(a: string, b: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a, b)
    }

    /*
    * @brgtz@
    * [en] Relative jump to +op2 if op1 > 0
    * [ru] Относительный переход на +op2, если op1 > 0
    */
    brgtz(a: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a)
    }

    /*
    * @brle@
    * [en] Relative jump to +op3 if op1 <= op2
    * [ru] Относительный переход на +op3, если op1 <= op2
    */
    brle(a: string, b: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a, b)
    }

    /*
    * @brlez@
    * [en] Relative jump to +op2 if op1 <= 0
    * [ru] Относительный переход на +op2, если op1 <= 0
    */
    brlez(a: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a)
    }

    /*
    * @brlt@
    * [en] Relative jump to +op3 if op1 < op2
    * [ru] Относительный переход на +op3, если op1 < op2
    */
    brlt(a: string, b: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a, b)
    }

    /*
    * @brltz@
    * [en] Relative jump to +op2 if op1 < 0
    * [ru] Относительный переход на +op2, если op1 < 0
    */
    brltz(a: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a)
    }

    /*
    * @brne@
    * [en] Relative jump to +op3 if op1 != op2
    * [ru] Относительный переход на +op3, если op1 != op2
    */
    brne(a: string, b: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a, b)
    }

    /*
    * @brnez@
    * [en] Relative jump to +op2 if op1 != 0
    * [ru] Относительный переход на +op2, если op1 != 0
    */
    brnez(a: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a)
    }

    /*
    * @brap@
    * [en] Relative jump to +op4 if op1 op2 with precision op3
    * [ru] Относительный переход на +op4, если op1 op2 с точностью op3
    */
    brap(x: string, y: string, c: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y, c)
    }

    /*
    * @brapz@
    * [en] Relative jump to +op3 if op1 0 with precision op2
    * [ru] Относительный переход на +op3, если op1 0 с точностью op2
    */
    brapz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
    }

    /*
    * @brna@
    * [en] Relative jump to +op4 if op1 op2 with precision op3
    * [ru] Относительный переход на +op4, если op1 op2 с точностью op3
    */
    brna(x: string, y: string, c: string, offset: string) {
        this.__bROp(this.__na.bind(this), offset, x, y, c)
    }

    /*
    * @brnaz@
    * [en] Relative jump to +op3 if op1 0 with precision op2
    * [ru] Относительный переход на +op3, если op1 0 с точностью op2
    */
    brnaz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
    }

    /*
    * @brdse@
    * [en] Relative jump to +op2 if channel op1 is configured
    * [ru] Относительный переход на +op2, если канал op1 настроен
    */
    brdse(d: string, offset: string) {
        if (this.__dse(d)) {
            this.jr(offset)
        }
    }

    /*
    * @brdns@
    * [en] Relative jump to +op2 if channel op1 is not configured
    * [ru] Относительный переход на +op2, если канал op1 не настроен
    */
    brdns(d: string, offset: string) {
        if (this.__dns(d)) {
            this.jr(offset)
        }
    }

    /*
    * @brnan@
    * [en]
    * [ru] Относительный переход на +op2, если op1 = nan
    */
    brnan(v: string, offset: string) {
        this.__bROp(this.__nan.bind(this), offset, v)
    }

    /*
    * @beqal@
    * [en] Jump to op3 if op1 = op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 = op2 с записью адреса следующей строки в ra
    */
    beqal(a: string, b: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a, b)
    }

    /*
    * @beqzal@
    * [en] Jump to op2 if op1 = 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 = 0 с записью адреса следующей строки в ra
    */
    beqzal(a: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a)
    }

    /*
    * @bgeal@
    * [en] Jump to op3 if op1 >= op2, writing next line address to ra
    * [ru] Переход на op3, если op1 >= op2 с записью адреса следующей строки в ra
    */
    bgeal(a: string, b: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a, b)
    }

    /*
    * @bgezal@
    * [en] Jump to op2 if op1 >= 0, writing next line address to ra
    * [ru] Переход на op2, если op1 >= 0 с записью адреса следующей строки в ra
    */
    bgezal(a: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a)
    }

    /*
    * @bgtal@
    * [en] Jump to op3 if op1 > op2, writing next line address to ra
    * [ru] Переход на op3, если op1 > op2 с записью адреса следующей строки в ra
    */
    bgtal(a: string, b: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a, b)
    }

    /*
    * @bgtzal@
    * [en] Jump to op2 if op1 > 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 > 0 с записью адреса следующей строки в ra
    */
    bgtzal(a: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a)
    }

    /*
    * @bleal@
    * [en] Jump to op3 if op1 <= op2, writing next line address to ra
    * [ru] Переход на op3, если op1 <= op2 с записью адреса следующей строки в ra
    */
    bleal(a: string, b: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a, b)
    }

    /*
    * @blezal@
    * [en] Jump to op2 if op1 <= 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 <= 0 с записью адреса следующей строки в ra
    */
    blezal(a: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a)
    }

    /*
    * @bltal@
    * [en] Jump to op3 if op1 < op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 < op2 с записью адреса следующей строки в ra
    */
    bltal(a: string, b: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a, b)
    }

    /*
    * @bltzal@
    * [en] Jump to op2 if op1 < 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 < 0 с записью адреса следующей строки в ra
    */
    bltzal(a: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a)
    }

    /*
    * @bneal@
    * [en] Jump to op3 if op1 != op2, writing next line address to ra
    * [ru] Переход на op3, если op1 != op2 с записью адреса следующей строки в ra
    */
    bneal(a: string, b: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a, b)
    }

    /*
    * @bnezal@
    * [en] Jump to op2 if op1 != 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 != 0 с записью адреса следующей строки в ra
    */
    bnezal(a: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a)
    }

    /*
    * @bapal@
    * [en] Jump to op4 if op1 op2 with precision op3, writing the address of the next line to ra
    * [ru] Переход на op4, если op1 op2 с точностью op3 с записью адреса следующей строки в ra
    */
    bapal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y, c)
    }

    /*
    * @bapzal@
    * [en] Jump to op3 if op1 0 with precision op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 0 с точностью op2 с записью адреса следующей строки в ra
    */
    bapzal(x: string, y: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y)
    }

    /*
    * @bnaal@
    * [en] Jump to op4 if op1 ~= op2 with precision op3, writing next line address to ra
    * [ru] Переход на op4, если op1 ~= op2 с точностью op3 с записью адреса следующей строки в ra
    */
    bnaal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y, c)
    }

    /*
    * @bnazal@
    * [en] Jump to op3 if op1 ~= 0 with precision op2, writing next line address to ra
    * [ru] Переход на op3, если op1 ~= 0 с точностью op2 с записью адреса следующей строки в ra
    */
    bnazal(x: string, y: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y)
    }

    /*
    * @bdseal@
    * [en] Jump to op2 if channel op1 is configured with next line address written to ra
    * [ru] Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra
    */
    bdseal(d: string, line: string) {
        if (this.__dse(d)) {
            this.jal(line)
        }
    }

    /*
    * @bdnsal@
    * [en] Jump to op2 if channel op1 is not configured, writing next line address to ra
    * [ru] Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra
    */
    bdnsal(d: string, line: string) {
        if (this.__dns(d)) {
            this.jal(line)
        }
    }

    /*
    * @push@
    * [en] Push op1 onto the stack
    * [ru] Положить op1 на стек
    */
    push(a: string) {
        this.memory.stack.push(this.memory.getValue(a))
    }

    /*
    * @pop@
    * [en] Pop a value from the stack and write to op1
    * [ru] Снять значение со стека и записать в op1
    */
    pop(register: string) {
        this.memory.getRegister(register).value = this.memory.stack.pop()
    }

    /*
    * @peek@
    * [en] Push the top value off the stack into op1 without moving the stack
    * [ru] Записать в op1 верхнее значение со стека не двигая стек
    */
    peek(register: string) {
        this.memory.getRegister(register).value = this.memory.stack.peek()
    }

    __transformBatch(values: number[], mode: string) {
        const modeMapping: Record<string, number | undefined> = modes

        const m = modeMapping[mode] ?? this.memory.getValue(mode)

        switch (m) {
            case modes.Average:
                return values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length
            case modes.Sum:
                return values.reduce((partial_sum, a) => partial_sum + a, 0)
            case modes.Minimum:
                return Math.min(...values)
            case modes.Maximum:
                return Math.max(...values)
        }

        throw new Ic10Error("Unknown batch mode", mode)
    }

    __getDevices(hash: number, name?: number) {
        const devices: Device[] = []

        //TODO: check all devices in the network
        for (let i = 0; i <= 5; i++) {
            const d = this.memory.getDevice('d' + i);

            if (d.hash == hash && (name === undefined || d.nameHash === name)) {
                devices.push(d)
            }
        }

        return devices
    }

    /*
    * @l@
    * [en] Reading the value of parameter op3 from port op2
    * [ru] Чтение значения параметра op3 из порта op2
    */
    l(register: string, device: string, property: string) {
        const r = this.memory.getRegister(register)
        const a = this.memory.getDeviceOrDeviceOutput(device)
        if (a instanceof Device) {
            if (!isDeviceParameter(property))
                throw new Ic10DiagnosticError(`Wrong third argument, expected device parameter`, property)
        } else {
            if (!isChannel(property))
                throw new Ic10DiagnosticError(`Wrong third argument, expected channel`, property)
        }
        r.value = a.get(property)
    }

    __l(register: string, device: string, property: string) {
        this.l(register, device, property)
    }

    /*
    * @ls@
    * [en] Read value op4 from slot op3 of port op2
    * [ru] Чтение из устройства op2, слота op3, параметра op4 в регистр op1
    */
    ls(register: string, device: string, slot: string, property: string) {
        const r = this.memory.getRegister(register)
        const d = this.memory.getDevice(device)
        r.value = d.getSlot(this.memory.getValue(slot), property) as number
    }

    /*
    * @s@
    * [en] Writing a value to the op2 parameter of port op1
    * [ru] Запись значения в параметр op2 порта op1
    */
    s(device: string, property: string, value: string) {
        const a = this.memory.getDeviceOrDeviceOutput(device)
        if (a instanceof Device) {
            if (!isDeviceParameter(property)) {
                throw new Ic10DiagnosticError(`Wrong second argument (${property}). Must be "Device parameter"`, property)
            }
        } else {
            if (!isChannel(property)) {
                throw new Ic10DiagnosticError(`Wrong second argument (${property}). Must be "Channel"`, property)
            }
        }
        a.set(property, this.memory.getValue(value))
    }

    __s(device: string, property: string, value: string) {
        this.s(device, property, value)
    }

    /*
    * @lb@
    * [en] Batch read in op1 from all devices with hash op2 of parameter op3 in op4 mode
    * [ru] Пакетное чтение в op1 из всех устройств с хешем op2 параметра op3 в режиме op4
    */
    lb(register: string, deviceHash: string, property: string, mode: string) {
        const hash = this.memory.getValue(deviceHash)

        const devices = this.__getDevices(hash)

        const values = devices.map(d => d.get(property) as number)

        if (values.length === 0)
            throw new Ic10DiagnosticError('Can`t find device with hash', hash)

        this.memory.getRegister(register).value = this.__transformBatch(values, mode)
    }

    /*
    * @lr@
    * [en] Read reagent value op4 in op3 mode from port op2
    * [ru] Чтение значения реагента op4 в режиме op3 из порта op2
    */
    lr(register: string, device: string, mode: string, property: string) {
        //TODO: well, we don't have reagents so we need to do it later
        throw new Ic10DiagnosticError("lr not implemented yet")
    }

    /*
    * @sb@
    * [en] Batch write to all devices with hash op1 to parameter op2 of value op3
    * [ru] Пакетная запись во все устройства с хешем op1 в параметр op2 значения op3
    */
    sb(deviceHash: string, property: string, value: string) {
        const hash = this.memory.getValue(deviceHash)
        const v = this.memory.getValue(value)
        const devices = this.__getDevices(hash)

        devices.forEach(d => d.set(property, v))
    }

    /*
    * @lbn@
    * [en]
    * [ru] Чтение c устройства по хеш op2 и HASH("name") op3 параметра op4 режимом чтение op5 в регистр op1
    */
    lbn(targetRegister: string, deviceHash: string, nameHash: string, property: string, batchMode: string) {
        const hash = this.memory.getValue(deviceHash);
        const name = this.memory.getValue(nameHash)
        const devices = this.__getDevices(hash, name)

        const values = devices.map(d => d.get(property) as number)
        if (values.length === 0)
            throw new Ic10Error("Can't find device with hash", hash)

        this.memory.getRegister(targetRegister).value = this.__transformBatch(values, batchMode)
    }

    /*
    * @sbn@
    * [en]
    * [ru] Записывает в устройство хеш op1, хеш имя HASH("name") op2, параметр op3 значение op4
    */
    sbn(deviceHash: string, nameHash: string, property: string, value: string) {
        const hash = this.memory.getValue(deviceHash)
        const v = this.memory.getValue(value)
        const name = this.memory.getValue(nameHash)
        const devices = this.__getDevices(hash, name)

        devices.forEach(d => d.set(property, v))
    }

    /*
    * @lbs@
    * [en]
    * [ru] Пакетное чтение слотов.
    */
    lbs(register: string, deviceHash: string, slotIndex: string, property: string, batchMode: string) {
        const hash = this.memory.getValue(deviceHash)
        const slot = this.memory.getValue(slotIndex)
        const devices = this.__getDevices(hash)

        const values = devices.map(d => d.getSlot(slot, property) as number)

        this.memory.getRegister(register).value = this.__transformBatch(values, batchMode)
    }

    /*
    * @lbns@
    * [en]
    * [ru] Чтение из устройства хеш op2, имя устройства HASH("name") op3, слота op4, параметра op5, способом op6 в регистр op1
    */
    lbns(register: string, deviceHash: string, nameHash: string, slotIndex: string, property: string, batchMode: string) {
        const hash = this.memory.getValue(deviceHash)
        const name = this.memory.getValue(nameHash)
        const slot = this.memory.getValue(slotIndex)
        const devices = this.__getDevices(hash, name)

        const values = devices.map(d => d.getSlot(slot, property) as number)

        this.memory.getRegister(register).value = this.__transformBatch(values, batchMode)
    }

    /*
    * @ss@
    * [en]
    * [ru] Запись в слот в устройства потр ор1, слот ор2, параметр ор3, значения ор4
    */
    ss(device: string, slotIndex: string, property: string, value: string) {
        const d = this.memory.getDevice(device)
        const v = this.memory.getValue(value)
        const slot = this.memory.getValue(slotIndex);

        (d.getSlot(slot) as Slot).set(property, v)
    }

    /*
    * @sbs@
    */
    sbs(deviceHash: string, slotIndex: string, property: string, value: string) {
        const hash = this.memory.getValue(deviceHash)
        const v = this.memory.getValue(value)
        const slot = this.memory.getValue(slotIndex);

        const devices = this.__getDevices(hash)

        devices.map(d => (d.getSlot(slot) as Slot).set(property, v))
    }

    /*
    * @and@
    * [en] Logical AND, one if both op2 and op3 are true, zero otherwise
    * [ru] Логическое И, единица, если и op2 и op3 истинны, ноль в противном случае
    */
    and(register: string, a: string, b: string) {
        this.__op((a, b) => a && b, register, a, b)
    }

    /*
    * @or@
    * [en] Logical OR, zero if both op2 and op3 are false, one otherwise
    * [ru] Логическое ИЛИ, ноль, если и op2 и op3 ложны, единица в противном случае
    */
    or(register: string, a: string, b: string) {
        this.__op((a, b) => a || b, register, a, b)
    }

    /*
    * @xor@
    * [en] XOR, one if one and only one of op2 and op3 is true, zero otherwise
    * [ru] Исключающее ИЛИ, единица, если одно и только одно из op2 и op3 истинно, ноль в противном случае
    */
    xor(register: string, a: string, b: string) {
        this.__op((a, b) => a ^ b, register, a, b)
    }

    /*
    * @nor@
    * [en] Inverse OR, one if both op2 and op3 are false, zero otherwise
    * [ru] Инверсное ИЛИ, единица, если и op2 и op3 ложны, ноль в противном случае
    */
    nor(register: string, a: string, b: string) {
        this.__op((a, b) => Number(!(a || b)), register, a, b)
    }

    _debug(...args: string[]) {
        this._log(...args)
    }

    _log(...args: string[]) {
        const out = [];
        try {
            for (const argumentsKey in args) {
                if (args.hasOwnProperty(argumentsKey)) {
                    let key = args[argumentsKey];

                    try {
                        const value = this.memory.findValue(key)

                        if (value !== undefined) {
                            out.push(`${key} = ${value};`)
                            break
                        }
                    } catch {
                    }

                    let keys = key.split('.');
                    try {
                        let environ = Object.keys(this.memory.environ);
                        if (environ.indexOf(keys[0]) >= 0) {
                            if (keys[0] == key) {
                                out.push(`${key} = ${JSON.stringify(this.memory.environ.get(key)?.properties)};`)
                                continue
                            }

                            switch (keys.length) {
                                case 2:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0])?.get(keys[1])};`)
                                    break;
                                case 3:
                                    out.push(`${key} = ${JSON.stringify(this.memory.environ.get(keys[0])?.getSlot(Number(keys[1])))};`)
                                    break;
                                case 4:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0])?.getSlot(Number(keys[2]), keys[3])};`)
                                    break;
                            }
                            continue
                        }
                        out.push(`${key};`)
                    } catch (e) {
                        // @ts-ignore
                        out.push(key + ' ' + e.message + '; ')
                    }
                }
            }
            this.settings.logCallback.call(this, `Log[${this.position}]: `, out)
        } catch (e) {
            console.debug(e)
        }
    }

    _d0(op1: any) {
        this.__d('d0', arguments)
    }

    _d1(op1: any) {
        this.__d('d1', arguments)
    }

    _d2(op1: any) {
        this.__d('d2', arguments)
    }

    _d3(op1: any) {
        this.__d('d3', arguments)
    }

    _d4(op1: any) {
        this.__d('d4', arguments)
    }

    _d5(op1: any) {
        this.__d('d5', arguments)
    }

    __d(device: string, args: any) {
        const d = this.memory.getDevice(device);
        switch (Object.keys(args).length) {
            case 0:
                throw new Ic10Error("Missing arguments")
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

    __debug(p: string, iArguments: string[]) {
        if (this.settings.debug) {
            this.settings.debugCallback.call(this, ...arguments)
        }
    }
}

export default InterpreterIc10;

