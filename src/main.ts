import {Ic10Error}   from "./ic10Error";
import {Memory}      from "./Memory";
import {Device}      from "./Device";
import {Slot}        from "./Slot";
import {MemoryCell}  from "./MemoryCell";
import {MemoryStack} from "./MemoryStack";

export const regexes = {
	'rr1'     : new RegExp("[rd]+(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
	'r1'      : new RegExp("^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$"),
	'd1'      : new RegExp("^d([012345b])$"),
	'rr'      : new RegExp("^d([012345b])$"),
	'strStart': new RegExp("^\".+$"),
	'strEnd'  : new RegExp(".+\"$"),
}

const modes = {
    Average: 0,
    Sum: 1,
    Minimum: 2,
    Maximum: 3
} as const

export type ReturnCode = "hcf" | "end" | "die"

export var Execution = {
	error(code: number, message: string, obj: any = null) {
		return new Ic10Error('--', code, message, obj, 0)
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
	public lines: string[]                                             = []
	public memory: Memory
	public position: number                                            = 0
	public interval: any
	public labels: { [key: string]: number }                           = {}
	public constants: {}
	public output: {
		debug: string,
		log: string,
		error: string,
	}
	public settings: InterpreterIc10Settings;
	public ignoreLine: Array<number>;

	constructor(code: string = '', settings: Partial<InterpreterIc10Settings> = {}) {
		this.code       = code
		this.memory     = new Memory(this)
		this.constants  = {}
		this.labels     = {}
		this.ignoreLine = []
		this.settings   = Object.assign({
											debug            : true,
											tickTime         : 100,
											debugCallback    : (a: string, b: any) => {
												this.output.debug = a + ' ' + JSON.stringify(b)
											},
											logCallback      : (a: string, b: any[]) => {
												this.output.log = a + ' ' + b.join('')
											},
											executionCallback: (e: Ic10Error) => {
												this.output.error = <string>Execution.display(e)
											},
										}, settings)
		this.memory.environ.randomize()
		if (code) {
			this.init(code)
		}
		this.output = {
			debug: '',
			log  : '',
			error: '',
		}
	}

	setSettings(settings: Partial<InterpreterIc10Settings> = {}): InterpreterIc10 {
		this.settings = Object.assign(this.settings, settings)
		return this;
	}

	init(text: string): InterpreterIc10 {
		this.lines     = text.split(/\r?\n/);
		const commands = this.lines
							 .map((line: string) => {
								 const args    = line.trim().split(/ +/)
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
		return this
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

	define(alias: string, value: number | string) {
		this.memory.define(alias, value)
	}

	alias(alias: string | number, target: string | number) {
		this.memory.alias(alias, target)
	}

	l(register: string, device: string, property: string) {
        const r = this.memory.getRegister(register)
        const value = this.memory.getDevice(device).get(property)
        r.set(null, value)
	}

	__l(register: string, device: string, property: string) {
		this.l(register, device, property)
	}

	ls(register: string, device: string, slot: string, property: string) {
        const r = this.memory.getRegister(register)
        const d = this.memory.getDevice(device)
        const value = d.getSlot(this.memory.getValue(slot), property)
        r.set(null, value)
	}

	s(device: string, property: string, value: string) {
		const d = this.memory.getDevice(device)
        d.set(property, this.memory.getValue(value))
	}

	__s(device: string, property: string, value: string) {
		this.s(device, property, value)
	}

    __op<Args extends number[]>(op: (...args: Args) => number, register: string, ...args: { [K in keyof Args]: string }) {
        const r = this.memory.getRegister(register)

        const inputs = args.map(v => this.memory.getValue(v)) as Args

        r.set(null, op(...inputs))
    }

	move(register: string, value: string) {
        this.__op(v => v, register, value)
	}

	__move(register: string, value: string) {
		this.move(register, value)
	}

	add(register: string, a: string, b: string) {
        this.__op((a, b) => a + b, register, a, b)
	}

	sub(register: string, a: string, b: string) {
        this.__op((a, b) => a - b, register, a, b)
	}

	mul(register: string, a: string, b: string) {
        this.__op((a, b) => a * b, register, a, b)
	}

	div(register: string, a: string, b: string) {
        this.__op((a, b) => Number(a / b) || 0, register, a, b)
	}

	mod(register: string, a: string, b: string) {
        this.__op((a, b) => a % b, register, a, b)
	}

	sqrt(register: string, v: string) {
        this.__op(Math.sqrt, register, v)
	}

	round(register: string, v: string) {
        this.__op(Math.round, register, v)
	}

    trunc(register: string, v: string) {
        this.__op(Math.trunc, register, v)
    }

    ceil(register: string, v: string) {
        this.__op(Math.ceil, register, v)
    }

    floor(register: string, v: string) {
        this.__op(Math.floor, register, v)
    }

	max(register: string, a: string, b: string) {
        this.__op(Math.max, register, a, b)
	}

    minx(register: string, a: string, b: string) {
        this.__op(Math.min, register, a, b)
    }

    abs(register: string, v: string) {
        this.__op(Math.abs, register, v)
    }

	log(register: string, v: string) {
        this.__op(Math.log, register, v)
	}

    exp(register: string, v: string) {
        this.__op(Math.exp, register, v)
    }

	rand(register: string, v: string) {
        this.__op(_ => Math.random(), register, v)
	}

    sin(register: string, v: string) {
        this.__op(Math.sin, register, v)
    }

    cos(register: string, v: string) {
        this.__op(Math.cos, register, v)
    }

    tan(register: string, v: string) {
        this.__op(Math.tan, register, v)
    }

    asin(register: string, v: string) {
        this.__op(Math.asin, register, v)
    }

    acos(register: string, v: string) {
        this.__op(Math.acos, register, v)
    }

    atan(register: string, v: string) {
        this.__op(Math.atan, register, v)
    }

	atan2(register: string, a: string, b: string) {
        this.__op(Math.atan2, register, a, b)
	}

	yield() {
	}

	sleep(s: number) {
        //TODO: yield for s * x ticks
	}

	select(register: string, a: string, b: string, c: string) {
        this.__op((a, b, c) => a ? b : c, register, a, b, c)
	}

	hcf() {
		console.log("Die Mother Fucker Die!!!!!")
	}

    __jump(line: number) {
        this.position = line
    }

    __call(line: number) {
        this.memory.getRegister("ra").set(null, this.position)
        this.__jump(line)
    }

    __getJumpTarget(target: string) {
        if (this.__issetLabel(target))
            return this.labels[target]

        const line = this.memory.getValue(target);

        if (isNaN(line))
            throw Execution.error(this.position, 'Incorrect jump target', [target, this.labels])

        return line
    }

	j(target: string) {
        this.__jump(this.__getJumpTarget(target))
    }

	jr(offset: string) {
        const d = this.memory.getValue(offset)

        if (Math.abs(d) < 0.001)
            throw Execution.error(this.position, "Infinite loop detected", offset)

        this.__jump(this.position + d - 1)
	}

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

    __sOp<Args extends number[]>(op: (...args: Args) => boolean, register: string, ...args: { [K in keyof Args]: string }) {
        const r = this.memory.getRegister(register)

        const inputs = args.map(v => this.memory.getValue(v)) as Args

        r.set(null, op(...inputs) ? 1 : 0)
    }

	seq(register: string, a: string, b: string) {
        this.__sOp(this.__eq.bind(this), register, a, b)
	}

	seqz(register: string, a: string) {
        this.__sOp(this.__eq.bind(this), register, a)
	}

	sge(register: string, a: string, b: string) {
        this.__sOp(this.__ge.bind(this), register, a, b)
	}

	sgez(register: string, a: string) {
        this.__sOp(this.__ge.bind(this), register, a)
	}

	sgt(register: string, a: string, b: string) {
		this.__sOp(this.__gt.bind(this), register, a, b)
	}

	sgtz(register: string, a: string) {
        this.__sOp(this.__gt.bind(this), register, a)
	}

	sle(register: string, a: string, b: string) {
        this.__sOp(this.__le.bind(this), register, a, b)
	}

	slez(register: string, a: string) {
        this.__sOp(this.__le.bind(this), register, a)
	}

	slt(register: string, a: string, b: string) {
        this.__sOp(this.__lt.bind(this), register, a, b)
	}

	sltz(register: string, a: string) {
        this.__sOp(this.__lt.bind(this), register, a)
	}

	sne(register: string, a: string, b: string) {
        this.__sOp(this.__ne.bind(this), register, a, b)
	}

	snez(register: string, a: string) {
        this.__sOp(this.__ne.bind(this), register, a)
	}

	sap(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__ap.bind(this), register, x, y, c)
	}

	sapz(register: string, x: string, y: string) {
        this.__sOp(this.__ap.bind(this), register, x, y)
	}

	sna(register: string, x: string, y: string, c: string) {
        this.__sOp(this.__na.bind(this), register, x, y, c)
	}

	snaz(register: string, x: string, y: string) {
        this.__sOp(this.__na.bind(this), register, x, y)
	}

	sdse(register: string, d: string) {
        this.memory.getRegister(register).set(null, Number(this.__dse(d)))
	}

	sdns(register: string, d: string) {
        this.memory.getRegister(register).set(null, Number(this.__dns(d)))
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

	beq(a: string, b: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a, b)
	}

	beqz(a: string, line: string) {
        this.__bOp(this.__eq.bind(this), line, a)
	}

	bge(a: string, b: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a, b)
	}

	bgez(a: string, line: string) {
        this.__bOp(this.__ge.bind(this), line, a)
	}

	bgt(a: string, b: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a, b)
	}

	bgtz(a: string, line: string) {
        this.__bOp(this.__gt.bind(this), line, a)
	}

	ble(a: string, b: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a, b)
	}

	blez(a: string, line: string) {
        this.__bOp(this.__le.bind(this), line, a)
	}

	blt(a: string, b: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a, b)
	}

	bltz(a: string, line: string) {
        this.__bOp(this.__lt.bind(this), line, a)
	}

	bne(a: string, b: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a, b)
	}

	bnez(a: string, line: string) {
        this.__bOp(this.__ne.bind(this), line, a)
	}

	bap(x: string, y: string, c: string, line: string) {
		this.__bOp(this.__ap.bind(this), line, x, y, c)
	}

	bapz(x: string, y: string, line: string) {
        this.__bOp(this.__ap.bind(this), line, x, y)
	}

	bna(x: string, y: string, c: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y, c)
	}

	bnaz(x: string, y: string, line: string) {
        this.__bOp(this.__na.bind(this), line, x, y)
	}

	bdse(d: string, line: string) {
        if (this.__dse(d))
            this.j(line)
	}

	bdns(d: string, line: string) {
		if (this.__dns(d))
            this.j(line)
	}

	breq(a: string, b: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a, b)
	}

	breqz(a: string, offset: string) {
        this.__bROp(this.__eq.bind(this), offset, a)
	}

	brge(a: string, b: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
	}

	brgez(a: string, offset: string) {
        this.__bROp(this.__ge.bind(this), offset, a)
	}

	brgt(a: string, b: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a, b)
	}

	brgtz(a: string, offset: string) {
        this.__bROp(this.__gt.bind(this), offset, a)
	}

	brle(a: string, b: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a, b)
	}

	brlez(a: string, offset: string) {
        this.__bROp(this.__le.bind(this), offset, a)
	}

	brlt(a: string, b: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a, b)
	}

	brltz(a: string, offset: string) {
        this.__bROp(this.__lt.bind(this), offset, a)
	}

	brne(a: string, b: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a, b)
	}

	brnez(a: string, offset: string) {
        this.__bROp(this.__ne.bind(this), offset, a)
	}

	brap(x: string, y: string, c: string, offset: string) {
		this.__bROp(this.__ap.bind(this), offset, x, y, c)
	}

	brapz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
	}

	brna(x: string, y: string, c: string, offset: string) {
        this.__bROp(this.__na.bind(this), offset, x, y, c)
	}

	brnaz(x: string, y: string, offset: string) {
        this.__bROp(this.__ap.bind(this), offset, x, y)
	}

	brdse(d: string, offset: string) {
		if (this.__dse(d)) {
			this.jr(offset)
		}
	}

	brdns(d: string, offset: string) {
		if (this.__dns(d)) {
			this.jr(offset)
		}
	}

	beqal(a: string, b: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a, b)
	}

	beqzal(a: string, line: string) {
        this.__bCOp(this.__eq.bind(this), line, a)
	}

	bgeal(a: string, b: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a, b)
	}

	bgezal(a: string, line: string) {
        this.__bCOp(this.__ge.bind(this), line, a)
	}

	bgtal(a: string, b: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a, b)
	}

	bgtzal(a: string, line: string) {
        this.__bCOp(this.__gt.bind(this), line, a)
	}

	bleal(a: string, b: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a, b)
	}

	blezal(a: string, line: string) {
        this.__bCOp(this.__le.bind(this), line, a)
	}

	bltal(a: string, b: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a, b)
	}

	bltzal(a: string, line: string) {
        this.__bCOp(this.__lt.bind(this), line, a)
	}

	bneal(a: string, b: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a, b)
	}

	bnezal(a: string, line: string) {
        this.__bCOp(this.__ne.bind(this), line, a)
	}

	bapal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y, c)
	}

	bapzal(x: string, y: string, line: string) {
        this.__bCOp(this.__ap.bind(this), line, x, y)
	}

	bnaal(x: string, y: string, c: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y, c)
	}

	bnazal(x: string, y: string, line: string) {
        this.__bCOp(this.__na.bind(this), line, x, y)
	}

	bdseal(d: string, line: string) {
		if (this.__dse(d)) {
			this.jal(line)
		}
	}

	bdnsal(d: string, line: string) {
		if (this.__dns(d)) {
			this.jal(line)
		}
	}

	push(a: string) {
        this.memory.stack.push(this.memory.getValue(a))
	}

	pop(register: string) {
        this.memory.getRegister(register).set(null, this.memory.stack.pop())
	}

	peek(register: string) {
        this.memory.getRegister(register).set(null, this.memory.stack.peek())
	}

	lb(register: string, deviceHash: string, property: string, mode: string) {
		const values = [];
		const hash   = this.memory.getValue(deviceHash)
		for (let i = 0; i <= 5; i++) {
			const d = this.memory.getDevice('d' + i);

            if (d.hash == hash) {
                values.push(d.get(property))
            }
		}
		if (values.length === 0) {
			throw Execution.error(this.position, 'Can`t find Device wich hash:', hash)
		}
		let result = 0;

        const modeMapping: Record<string, number | undefined> = modes

        const m = modeMapping[mode] ?? this.memory.getValue(mode)

		switch (m) {
			case modes.Average:
				// @ts-ignore
				result = values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length
				break;
			case modes.Sum:
				// @ts-ignore
				result = values.reduce((partial_sum, a) => partial_sum + a, 0)
				break;
			case modes.Minimum:
				// @ts-ignore
				result = Math.min.apply(null, values)
				break;
			case modes.Maximum:
				// @ts-ignore
				result = Math.max.apply(null, values)
				break;

		}
        this.memory.getRegister(register).set(null, Number(result))
	}

	lr(register: string, device: string, mode: string, op4: any) {
		const values = [];
		const d = this.memory.getDevice(device);

        for (const slotsKey in d.properties.slots) {
            if (d.properties.slots[slotsKey] instanceof Slot) {
                const slot: Slot = d.properties.slots[slotsKey];
                values.push(slot.get(op4))
            }
        }

		let result = 0;

        const modeMapping: Record<string, number | undefined> = modes

        const m = modeMapping[mode] ?? this.memory.getValue(mode)

		switch (m) {
			case modes.Average:
				result = values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length
				break;
			case modes.Sum:
				result = values.reduce((partial_sum, a) => partial_sum + a, 0)
				break;
			case 2:
			case modes.Minimum:
				result = Math.min.apply(null, values)
				break;
			case 3:
			case modes.Maximum:
				result = Math.max.apply(null, values)
				break;
		}

        this.memory.getRegister(register).set(null, result)
	}

	sb(op1: any, op2: any, op3: any, op4: any) {
		const hash = this.memory.cell(op1);
		for (let i = 0; i <= 5; i++) {
			const d: MemoryCell | MemoryStack | Device | number = this.memory.getCell('d' + i);
			if (d instanceof Device) {
				if (d.hash == hash) {
					d.set(op2, op3)
				}
			}
		}
	}

    lbn(targetRegister: any, deviceHash: any, nameHash: any, property: any, batchMode: any) {
        const values: number[] = [];
        const hash   = this.memory.cell(deviceHash);
        for (let i = 0; i <= 5; i++) {
            const d: MemoryCell | MemoryStack | Device | number = this.memory.getCell('d' + i);
            if (d instanceof Device) {
                if (d.hash == hash) {
                    values.push(d.get(property) as number)
                }
            }
        }
        if (values.length === 0) {
            throw Execution.error(this.position, 'Can`t find Device wich hash:', hash)
        }
        let result = 0;
        switch (batchMode) {
            case 0:
            case 'Average':
                // @ts-ignore
                result = values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length
                break;
            case 1:
            case 'Sum':
                // @ts-ignore
                result = values.reduce((partial_sum, a) => partial_sum + a, 0)
                break;
            case 2:
            case 'Minimum':
                // @ts-ignore
                result = Math.min.apply(null, values)
                break;
            case 3:
            case 'Maximum':
                // @ts-ignore
                result = Math.max.apply(null, values)
                break;

        }
        this.memory.cell(targetRegister, Number(result))
    }

    sbn() {}

    lbs() {}

    lbns() {}

    ss() {}

    sbs() {}

    snan() {}

    snanz() {}

    bnan() {}

    brnan() {}

	and(register: string, a: string, b: string) {
        this.__op((a, b) => a && b, register, a, b)
	}

	or(register: string, a: string, b: string) {
		this.__op((a, b) => a || b, register, a, b)
	}

	xor(register: string, a: string, b: string) {
		this.__op((a, b) => a ^ b, register, a ,b)
	}

	nor(register: string, a: string, b: string) {
		this.__op((a, b) => Number(!(a || b)), register, a, b)
	}

	_debug(...args: string[]){
		this._log(...args)
	}
	_log(...args: string[]) {
		const out = [];
		try {
			for (const argumentsKey in args) {
				if (args.hasOwnProperty(argumentsKey)) {
					let key = args[argumentsKey];
                    try {
                        const o = this.memory.cell(key)
                        if (o) {
                            out.push(key + ' = ' + o + '; ')
                            break
                        }
                    } catch (e) {

                    }
                    let keys = key.split('.');
                    try {
                        let cells = Object.keys(this.memory.cells);
                        let environ = Object.keys(this.memory.environ);
                        let aliases = Object.keys(this.memory.aliases);
                        if (environ.indexOf(keys[0]) >= 0) {
                            if (keys[0] == key) {
                                // @ts-ignore
                                out.push(key + ' = ' + JSON.stringify(this.memory.environ[key].properties) + '; ')
                            } else {
                                switch (keys.length) {
                                    case 2:
                                        // @ts-ignore
                                        out.push(key + ' = ' + this.memory.environ[keys[0]].get(keys[1]) + '; ')
                                        break;
                                    case 3:
                                        // @ts-ignore
                                        out.push(key + ' = ' + JSON.stringify(this.memory.environ[keys[0]].getSlot(keys[1])) + '; ')
                                        break;
                                    case 4:
                                        // @ts-ignore
                                        out.push(key + ' = ' + this.memory.environ[keys[0]].getSlot(keys[2], keys[3]) + '; ')
                                        break;
                                }

                            }
                            continue
                        }
                        try {
                            if (this.memory.getCell(keys[0]) instanceof MemoryCell) {
                                const cell = this.memory.getCell(arguments[argumentsKey])
                                if (cell instanceof MemoryCell) {
                                    out.push(key + ' = ' + cell.value + '; ')
                                } else {
                                    out.push(key + ' = ' + cell + '; ')
                                }
                                continue
                            }
                        } catch (e) {
                        }
                        out.push(key + '; ')
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
		const d: MemoryCell | MemoryStack | Device | number = this.memory.getCell(device);
		switch (Object.keys(args).length) {
			case 0:
				throw Execution.error(this.position, 'missing arguments');
			case 1:
				if (d instanceof Device) {
					d.hash = args[0];
				}
				break;
			case 2:
				if (d instanceof Device) {
					d.set(args[0], args[1]);
				}
				break;
			case 3:
				if (d instanceof Device) {
					d.setSlot(args[0], args[1], args[2]);
				}
		}

	}

	__debug(p: string, iArguments: string[]) {
		if (this.settings.debug) {
			this.settings.debugCallback.call(this, ...arguments)
		}
	}
}

export default InterpreterIc10;