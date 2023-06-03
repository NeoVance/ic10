import {Ic10DiagnosticError, Ic10Error} from "./Ic10Error";
import {Memory} from "./Memory";
import {Device, IcHash} from "./Device";
import {Slot} from "./Slot";
import {isChannel, isConst, isDeviceParameter,isSlotParameter} from "./icTypes";
import {DeviceOutput} from "./DeviceOutput";

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

export var Execution = {
    error(code: number, message: string, obj: any = null,loc?:{start:number,len:number}) {
        return new Ic10Error('--', code, message, obj, 0,loc)
    },
    Ic10DiagnosticError(code: number, message: string, obj: any = null,loc?:{start:number,len:number}) {
        return new Ic10DiagnosticError('--', code, message, obj, 0,loc)
    },
    display: function (e: { code: any; message: any; lvl: any; obj: any; }) {
        if (e instanceof Ic10Error) {
            const string = `(${e.code}) - ${e.message}:`;
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
        } else {
            console.log(e)
            return e;
        }
    }
}

export type InterpreterIc10Settings = {
    debug: boolean;
    debugCallback: Function;
    logCallback: Function;
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
                device.name = "db"
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
                } else if (!isComment) {
                    throw Execution.error(this.position, 'Undefined function', command)
                }
            } catch (e) {
                if (e instanceof Ic10Error)
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

    runUntil(cond: (status: true | ReturnCode) => boolean, maxIterations: number = 0) {
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
    */
    define(alias: string, value: number | string) {
		if(isChannel(alias.toLowerCase()) || isSlotParameter(alias.toLowerCase()) || isDeviceParameter(alias.toLowerCase()) || isConst(alias.toLowerCase())){
			throw Execution.Ic10DiagnosticError(this.position, 'Incorrect constant. Is system keyworld', alias)
		}
        this.memory.define(alias, value)
    }
    /*
    * @alias@
    */
    alias(alias: string , target: string) {
		if(isChannel(alias.toLowerCase()) || isSlotParameter(alias.toLowerCase()) || isDeviceParameter(alias.toLowerCase()) || isConst(alias.toLowerCase())){
			throw Execution.Ic10DiagnosticError(this.position, 'Incorrect alias. Is system keyworld', alias)
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
    */
    move(register: string, value: string) {
        this.__op(v => v, register, value)
    }

    __move(register: string, value: string) {
        this.move(register, value)
    }
    /*
    * @add@
    */
    add(register: string, a: string, b: string) {
        this.__op((a, b) => a + b, register, a, b)
    }
    /*
    * @sub@
    */
    sub(register: string, a: string, b: string) {
        this.__op((a, b) => a - b, register, a, b)
    }
    /*
    * @mul@
    */
    mul(register: string, a: string, b: string) {
        this.__op((a, b) => a * b, register, a, b)
    }
    /*
    * @div@
    */
    div(register: string, a: string, b: string) {
        this.__op((a, b) => Number(a / b) || 0, register, a, b)
    }
    /*
    * @mod@
    */
    mod(register: string, a: string, b: string) {
        this.__op((a, b) => a % b, register, a, b)
    }
    /*
    * @sqrt@
    */
    sqrt(register: string, v: string) {
        this.__op(Math.sqrt, register, v)
    }
    /*
    * @round@
    */
    round(register: string, v: string) {
        this.__op(Math.round, register, v)
    }
    /*
    * @trunc@
    */
    trunc(register: string, v: string) {
        this.__op(Math.trunc, register, v)
    }
    /*
    * @ceil@
    */
    ceil(register: string, v: string) {
        this.__op(Math.ceil, register, v)
    }
    /*
    * @floor@
    */
    floor(register: string, v: string) {
        this.__op(Math.floor, register, v)
    }
    /*
    * @max@
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
    */
    abs(register: string, v: string) {
        this.__op(Math.abs, register, v)
    }
    /*
    * @log@
    */
    log(register: string, v: string) {
        this.__op(Math.log, register, v)
    }
    /*
    * @exp@
    */
    exp(register: string, v: string) {
        this.__op(Math.exp, register, v)
    }
    /*
    * @rand@
    */
    rand(register: string, v: string) {
        this.__op(_ => Math.random(), register, v)
    }
    /*
    * @sin@
    */
    sin(register: string, v: string) {
        this.__op(Math.sin, register, v)
    }
    /*
    * @cos@
    */
    cos(register: string, v: string) {
        this.__op(Math.cos, register, v)
    }
    /*
    * @tan@
    */
    tan(register: string, v: string) {
        this.__op(Math.tan, register, v)
    }
    /*
    * @asin@
    */
    asin(register: string, v: string) {
        this.__op(Math.asin, register, v)
    }
    /*
    * @acos@
    */
    acos(register: string, v: string) {
        this.__op(Math.acos, register, v)
    }
    /*
    * @atan@
    */
    atan(register: string, v: string) {
        this.__op(Math.atan, register, v)
    }
    /*
    * @atan2@
    */
    atan2(register: string, a: string, b: string) {
        this.__op(Math.atan2, register, a, b)
    }
    /*
    * @yield@
    */
    yield() {
    }
    /*
    * @sleep@
    */
    sleep(s: number) {
        //TODO: yield for s * x ticks
    }
    /*
    * @select@
    */
    select(register: string, a: string, b: string, c: string) {
        this.__op((a, b, c) => a ? b : c, register, a, b, c)
    }
    /*
    * @hcf@
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
            throw Execution.Ic10DiagnosticError(this.position, 'Incorrect jump target', [target, this.labels])

        return line
    }
    /*
    * @j@
    */
    j(target: string) {
        this.__jump(this.__getJumpTarget(target))
    }
    /*
    * @jr@
    */
    jr(offset: string) {
        const d = this.memory.getValue(offset)

        if (Math.abs(d) < 0.001)
            throw Execution.error(this.position, "Infinite loop detected", offset)

        this.__jump(this.position + d - 1)
    }
    /*
    * @jal@
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
    */
    seq(register: string, a: string, b: string) {
        this.__sOp(this.__eq.bind(this), register, a, b)
    }
    /*
    * @seqz@
    */
    seqz(register: string, a: string) {
        this.__sOp(this.__eq.bind(this), register, a)
    }
    /*
    * @sge@
    */
    sge(register: string, a: string, b: string) {
        this.__sOp(this.__ge.bind(this), register, a, b)
    }
    /*
    * @sgez@
    */
    sgez(register: string, a: string) {
        this.__sOp(this.__ge.bind(this), register, a)
    }
    /*
    * @sgt@
    */
    sgt(register: string, a: string, b: string) {
        this.__sOp(this.__gt.bind(this), register, a, b)
    }
    /*
    * @sgtz@
    */
    sgtz(register: string, a: string) {
        this.__sOp(this.__gt.bind(this), register, a)
    }
    /*
    * @sle@
    */
    sle(register: string, a: string, b: string) {
        this.__sOp(this.__le.bind(this), register, a, b)
    }
    /*
    * @slez@
    */
    slez(register: string, a: string) {
        this.__sOp(this.__le.bind(this), register, a)
    }
    /*
    * @slt@
    */
    slt(register: string, a: string, b: string) {
        this.__sOp(this.__lt.bind(this), register, a, b)
    }
    /*
    * @sltz@
    */
    sltz(register: string, a: string) {
        this.__sOp(this.__lt.bind(this), register, a)
    }
    /*
    * @sne@
    */
    sne(register: string, a: string, b: string) {
        this.__sOp(this.__ne.bind(this), register, a, b)
    }
    /*
    * @snez@
    */
    snez(register: string, a: string) {
        this.__sOp(this.__ne.bind(this), register, a)
    }
    /*
    * @sap@
    */
    sap(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__ap.bind(this), register, x, y, c)
    }
    /*
    * @sapz@
    */
    sapz(register: string, x: string, y: string) {
        this.__sOp(this.__ap.bind(this), register, x, y)
    }
    /*
    * @sna@
    */
    sna(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__na.bind(this), register, x, y, c)
    }
    /*
    * @snaz@
    */
    snaz(register: string, x: string, y: string) {
        this.__sOp(this.__na.bind(this), register, x, y)
    }
    /*
    * @sdse@
    */
    sdse(register: string, d: string) {
        this.memory.getRegister(register).value = Number(this.__dse(d))
    }
    /*
    * @sdns@
    */
    sdns(register: string, d: string) {
        this.memory.getRegister(register).value = Number(this.__dns(d))
    }
    /*
    * @snan@
    */
    snan(register: string, v: string) {
        this.__sOp(this.__nan.bind(this), register, v)
    }
    /*
    * @snanz@
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
    */
    beq(a: string, b: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a, b)
    }
    /*
    * @beqz@
    */
    beqz(a: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a)
    }
    /*
    * @bge@
    */
    bge(a: string, b: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a, b)
    }
    /*
    * @bgez@
    */
    bgez(a: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a)
    }
    /*
    * @bgt@
    */
    bgt(a: string, b: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a, b)
    }
    /*
    * @bgtz@
    */
    bgtz(a: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a)
    }
    /*
    * @ble@
    */
    ble(a: string, b: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a, b)
    }
    /*
    * @blez@
    */
    blez(a: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a)
    }
    /*
    * @blt@
    */
    blt(a: string, b: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a, b)
    }
    /*
    * @bltz@
    */
    bltz(a: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a)
    }
    /*
    * @bne@
    */
    bne(a: string, b: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a, b)
    }
    /*
    * @bnez@
    */
    bnez(a: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a)
    }
    /*
    * @bap@
    */
    bap(x: string, y: string, c: string, line: string) {
        this.__bOp(this.__ap.bind(this), line, x, y, c)
    }
    /*
    * @bapz@
    */
    bapz(x: string, y: string, line: string) {
        this.__bOp(this.__ap.bind(this), line, x, y)
    }
    /*
    * @bna@
    */
    bna(x: string, y: string, c: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y, c)
    }
    /*
    * @bnaz@
    */
    bnaz(x: string, y: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y)
    }
    /*
    * @bdse@
    */
    bdse(d: string, line: string) {
        if (this.__dse(d))
            this.j(line)
    }
    /*
    * @bdns@
    */
    bdns(d: string, line: string) {
        if (this.__dns(d))
            this.j(line)
    }
    /*
    * @bnan@
    */
    bnan(v: string, line: string) {
        this.__bOp(this.__nan.bind(this), line, v)
    }
    /*
    * @breq@
    */
    breq(a: string, b: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a, b)
    }
    /*
    * @breqz@
    */
    breqz(a: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a)
    }
    /*
    * @brge@
    */
    brge(a: string, b: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
    }
    /*
    * @brgez@
    */
    brgez(a: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
    }
    /*
    * @brgt@
    */
    brgt(a: string, b: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a, b)
    }
    /*
    * @brgtz@
    */
    brgtz(a: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a)
    }
    /*
    * @brle@
    */
    brle(a: string, b: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a, b)
    }
    /*
    * @brlez@
    */
    brlez(a: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a)
    }
    /*
    * @brlt@
    */
    brlt(a: string, b: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a, b)
    }
    /*
    * @brltz@
    */
    brltz(a: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a)
    }
    /*
    * @brne@
    */
    brne(a: string, b: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a, b)
    }
    /*
    * @brnez@
    */
    brnez(a: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a)
    }
    /*
    * @brap@
    */
    brap(x: string, y: string, c: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y, c)
    }
    /*
    * @brapz@
    */
    brapz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
    }
    /*
    * @brna@
    */
    brna(x: string, y: string, c: string, offset: string) {
        this.__bROp(this.__na.bind(this), offset, x, y, c)
    }
    /*
    * @brnaz@
    */
    brnaz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
    }
    /*
    * @brdse@
    */
    brdse(d: string, offset: string) {
        if (this.__dse(d)) {
            this.jr(offset)
        }
    }
    /*
    * @brdns@
    */
    brdns(d: string, offset: string) {
        if (this.__dns(d)) {
            this.jr(offset)
        }
    }
    /*
    * @brnan@
    */
    brnan(v: string, offset: string) {
        this.__bROp(this.__nan.bind(this), offset, v)
    }
    /*
    * @beqal@
    */
    beqal(a: string, b: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a, b)
    }
    /*
    * @beqzal@
    */
    beqzal(a: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a)
    }
    /*
    * @bgeal@
    */
    bgeal(a: string, b: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a, b)
    }
    /*
    * @bgezal@
    */
    bgezal(a: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a)
    }
    /*
    * @bgtal@
    */
    bgtal(a: string, b: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a, b)
    }
    /*
    * @bgtzal@
    */
    bgtzal(a: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a)
    }
    /*
    * @bleal@
    */
    bleal(a: string, b: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a, b)
    }
    /*
    * @blezal@
    */
    blezal(a: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a)
    }
    /*
    * @bltal@
    */
    bltal(a: string, b: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a, b)
    }
    /*
    * @bltzal@
    */
    bltzal(a: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a)
    }
    /*
    * @bneal@
    */
    bneal(a: string, b: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a, b)
    }
    /*
    * @bnezal@
    */
    bnezal(a: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a)
    }
    /*
    * @bapal@
    */
    bapal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y, c)
    }
    /*
    * @bapzal@
    */
    bapzal(x: string, y: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y)
    }
    /*
    * @bnaal@
    */
    bnaal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y, c)
    }
    /*
    * @bnazal@
    */
    bnazal(x: string, y: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y)
    }
    /*
    * @bdseal@
    */
    bdseal(d: string, line: string) {
        if (this.__dse(d)) {
            this.jal(line)
        }
    }
    /*
    * @bdnsal@
    */
    bdnsal(d: string, line: string) {
        if (this.__dns(d)) {
            this.jal(line)
        }
    }
    /*
    * @push@
    */
    push(a: string) {
        this.memory.stack.push(this.memory.getValue(a))
    }
    /*
    * @pop@
    */
    pop(register: string) {
        this.memory.getRegister(register).value = this.memory.stack.pop()
    }
    /*
    * @peek@
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

        throw Execution.Ic10DiagnosticError(this.position, "Unknown batch mode", mode)
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
    */
    l(register: string, device: string, property: string) {
        const r = this.memory.getRegister(register)
        const a = this.memory.getDeviceOrDeviceOutput(device)
        if (a instanceof Device) {
            if (!isDeviceParameter(property)) {
                throw Execution.Ic10DiagnosticError(this.position, `Wrong 3 argument (${property}). Must be "Device parameter"`,property)
            }
        } else if (a instanceof DeviceOutput) {
            if (!isChannel(property)) {
                throw Execution.Ic10DiagnosticError(this.position, `Wrong 3 argument (${property}). Must be "Channel"`,property)
            }
        }
        r.value = a.get(property)
    }

    __l(register: string, device: string, property: string) {
        this.l(register, device, property)
    }
    /*
    * @ls@
    */
    ls(register: string, device: string, slot: string, property: string) {
        const r = this.memory.getRegister(register)
        const d = this.memory.getDevice(device)
        r.value = d.getSlot(this.memory.getValue(slot), property) as number
    }
    /*
    * @s@
    */
    s(device: string, property: string, value: string) {
		const a = this.memory.getDeviceOrDeviceOutput(device)
		if (a instanceof Device) {
			if (!isDeviceParameter(property)) {
				throw Execution.Ic10DiagnosticError(this.position, `Wrong 2 argument (${property}). Must be "Device parameter"`,property)
			}
		} else if (a instanceof DeviceOutput) {
			if (!isChannel(property)) {
				throw Execution.Ic10DiagnosticError(this.position, `Wrong 2 argument (${property}). Must be "Channel"`,property)
			}
		}
		a.set(property, this.memory.getValue(value))
    }
    __s(device: string, property: string, value: string) {
        this.s(device, property, value)
    }
    /*
    * @lb@
    */
    lb(register: string, deviceHash: string, property: string, mode: string) {
        const hash = this.memory.getValue(deviceHash)

        const devices = this.__getDevices(hash)

        const values = devices.map(d => d.get(property) as number)

        if (values.length === 0)
            throw Execution.Ic10DiagnosticError(this.position, 'Can`t find Device wich hash:', hash)

        this.memory.getRegister(register).value = this.__transformBatch(values, mode)
    }
    /*
    * @lr@
    */
    lr(register: string, device: string, mode: string, property: string) {
        //TODO: well, we don't have reagents so we need to do it later
        throw Execution.Ic10DiagnosticError(this.position, "lr not implemented yet")
    }
    /*
    * @sb@
    */
    sb(deviceHash: string, property: string, value: string) {
        const hash = this.memory.getValue(deviceHash)
        const v = this.memory.getValue(value)
        const devices = this.__getDevices(hash)

        devices.forEach(d => d.set(property, v))
    }
    /*
    * @lbn@
    */
    lbn(targetRegister: string, deviceHash: string, nameHash: string, property: string, batchMode: string) {
        const hash = this.memory.getValue(deviceHash);
        const name = this.memory.getValue(nameHash)
        const devices = this.__getDevices(hash, name)

        const values = devices.map(d => d.get(property) as number)
        if (values.length === 0)
            throw Execution.error(this.position, 'Can`t find Device wich hash:', hash)

        this.memory.getRegister(targetRegister).value = this.__transformBatch(values, batchMode)
    }
    /*
    * @sbn@
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
    */
    and(register: string, a: string, b: string) {
        this.__op((a, b) => a && b, register, a, b)
    }
    /*
    * @or@
    */
    or(register: string, a: string, b: string) {
        this.__op((a, b) => a || b, register, a, b)
    }
    /*
    * @xor@
    */
    xor(register: string, a: string, b: string) {
        this.__op((a, b) => a ^ b, register, a, b)
    }
    /*
    * @nor@
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
                                out.push(`${key} = ${JSON.stringify(this.memory.environ.get(key).properties)};`)
                                continue
                            }

                            switch (keys.length) {
                                case 2:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0]).get(keys[1])};`)
                                    break;
                                case 3:
                                    out.push(`${key} = ${JSON.stringify(this.memory.environ.get(keys[0]).getSlot(Number(keys[1])))};`)
                                    break;
                                case 4:
                                    out.push(`${key} = ${this.memory.environ.get(keys[0]).getSlot(Number(keys[2]), keys[3])};`)
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
                throw Execution.error(this.position, 'missing arguments');
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

