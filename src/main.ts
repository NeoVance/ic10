import {ic10Error}   from "./ic10Error";
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
export var Execution = {
	error(code: number, message: string, obj: any = null) {
		return new ic10Error('--', code, message, obj, 0)
	},
	display: function (e: { code: any; message: any; lvl: any; obj: any; }) {
		if (e instanceof ic10Error) {
			// var string = `[${e.functionName}:${e.line}] (${e.code}) - ${e.message}:`
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
	public settings: {
		debug: boolean;
		debugCallback: Function;
		logCallback: Function;
		executionCallback: Function;
		tickTime: number;
	};
	public ignoreLine: Array<number>;

	constructor(code: string = '', settings = {}) {
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
											executionCallback: (e: ic10Error) => {
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

	setSettings(settings: object = {}): InterpreterIc10 {
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
				let command                              = commands[commandsKey]
				const newArgs: { [key: string]: string } = {};
				let mode                                 = 0;
				let argNumber                            = 0;
				for (let argsKey in command.args) {
					if (command.args.hasOwnProperty(argsKey)) {
						let arg = command.args[argsKey]
						if (arg.startsWith("#")) {
							break;
						}
						if (mode === 0) {
							argNumber++
						}
						if (regexes.strStart.test(arg)) {
							mode = 1
						}
						if (argNumber in newArgs) {
							newArgs[argNumber] += ' ' + arg
						} else {
							newArgs[argNumber] = arg
						}
						if (regexes.strEnd.test(arg)) {
							mode = 0
						}
					}
				}
				commands[commandsKey].args = Object.values(newArgs)
			} else {
				commands.push({command: '', args: []})
			}
		}
		this.commands = commands
		this.position = 0
		while (this.position < this.commands.length) {
			let {command, args} = this.commands[this.position]
			this.position++
			if (command?.match(/^\w+:$/)) {
				let label                             = command.replace(":", "")
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

	prepareLine(line = -1, isDebugger = false): string | true {
		if (line > 0) {
			this.position = line;
		}
		// this.memory.environ.randomize()
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
				this.settings.executionCallback.call(this, e)
			}
		}
		if (command === "hcf") return 'hcf'
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

	__issetLabel(x: string) {
		return x in this.labels
	}

	define(op1: any, op2: any, op3: any, op4: any) {
		this.memory.define(op1, op2)
	}

	alias(op1: any, op2: any, op3: any, op4: any) {
		this.memory.alias(op1, op2)
	}

	l(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(op2, op3))
	}

	__l(op1: any, op2: any, op3: any, op4: any) {
		this.l(op1, op2, op3, op4)
	}

	ls(op1: any, op2: any, op3: any, op4: any) {
		const d = this.memory.getCell(op2);
		if (d instanceof Device) {
			this.memory.cell(op1, d.getSlot(this.memory.cell(op3), op4))
		} else {
			throw Execution.error(this.position, 'Unknown Device', op2)
		}
	}

	s(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, op2, op3)
	}

	__s(op1: any, op2: any, op3: any, op4: any) {
		this.s(op1, op2, op3, op4)
	}

	move(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(op2))
	}

	__move(op1: any, op2: any, op3: any, op4: any) {
		this.move(op1, op2, op3, op4)
	}

	add(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(op2) + this.memory.cell(op3))
	}

	sub(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(op2) - this.memory.cell(op3))
	}

	mul(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(op2) * this.memory.cell(op3))
	}

	div(op1: any, op2: any, op3: any, op4: any) {
		const div = this.memory.cell(op2) / this.memory.cell(op3);
		this.memory.cell(op1, Number(div) || 0)
	}

	mod(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.abs(this.memory.cell(op2) % this.memory.cell(op3)))
	}

	sqrt(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.sqrt(this.memory.cell(op2)))
	}

	round(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.round(this.memory.cell(op2)))
	}

	trunc(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.trunc(this.memory.cell(op2)))
	}

	ceil(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.ceil(this.memory.cell(op2)))
	}

	floor(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.floor(this.memory.cell(op2)))
	}

	max(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.max(this.memory.cell(op2), this.memory.cell(op3)))
	}

	min(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.min(this.memory.cell(op2), this.memory.cell(op3)))
	}

	abs(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.abs(this.memory.cell(op2)))
	}

	log(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.log(this.memory.cell(op2)))
	}

	exp(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.exp(this.memory.cell(op2)))
	}

	rand(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.random())
	}

	sin(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.sin(this.memory.cell(op2)))
	}

	cos(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.cos(this.memory.cell(op2)))
	}

	tan(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.tan(this.memory.cell(op2)))
	}

	asin(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.asin(this.memory.cell(op2)))
	}

	acos(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.acos(this.memory.cell(op2)))
	}

	atan(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, Math.atan(this.memory.cell(op2)))
	}

	atan2(op1: any, op2: any, op3: any, op4: any) {

		this.memory.cell(op1, Math.atan2(this.memory.cell(op2), this.memory.cell(op3)))
	}

	yield(op1: any, op2: any, op3: any, op4: any) {
	}

	sleep(op1: any, op2: any, op3: any, op4: any) {
	}

	select(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.cell(this.memory.cell(op2) ? this.memory.cell(op3) : this.memory.cell(op4)))
	}

	hcf(op1: any, op2: any, op3: any, op4: any) {
		console.log("Die Mother Fucker Die Mother Fucker Die !!!!!")
	}

	j(op1: any) {
		if (this.__issetLabel(op1)) {
			this.position = this.labels[op1]
		} else {
			const line = this.memory.cell(op1);
			if (!isNaN(line)) {
				this.position = line
			} else {
				throw Execution.error(this.position, 'Undefined label', [op1, this.labels])
			}
		}
	}

	jr(op1: any) {
		let jr = 0;
		if (op1 > 0 || 0 > op1) {
			jr = op1
		} else {
			throw Execution.error(this.position, 'Can`t move on', op1)
		}
		this.position += jr;
		this.position--
	}

	jal(op1: any) {
		this.memory.cell('r17', this.position)
		this.j(op1)
	}

	__eq(op1 = 0, op2 = 0) {
		return Number(op1 == op2)
	}

	__ge(op1 = 0, op2 = 0) {
		return Number(op1 >= op2)
	}

	__gt(op1 = 0, op2 = 0) {
		return Number(op1 > op2)
	}

	__le(op1 = 0, op2 = 0) {
		return Number(op1 <= op2)
	}

	__lt(op1 = 0, op2 = 0) {
		return Number(op1 < op2)
	}

	__ne(op1 = 0, op2 = 0) {
		return Number(op1 != op2)
	}

	__ap(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
		return Number(!this.__na(...arguments))
	}

	__na(x = 0, y = 0, d = 0, op4 = 0) {
		if (y == 0) {
			return Number(d > 0)
		}
		return Number(Math.abs(x - y) > d * Math.max(Math.abs(x), Math.abs(y)))
	}

	__dse(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
		try {
			this.memory.getCell(op1)
			return 1
		} catch (e) {
			return 0
		}
	}

	__dns(op1 = 0, op2 = 0, op3 = 0, op4 = 0) {
		try {
			this.memory.getCell(op1)
			return 0
		} catch (e) {
			return 1
		}
	}


	seq(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__eq(this.memory.cell(op2), this.memory.cell(op3)))
	}

	seqz(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__eq(this.memory.cell(op2), 0))
	}

	sge(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ge(this.memory.cell(op2), this.memory.cell(op3)))
	}

	sgez(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ge(this.memory.cell(op2), 0))
	}

	sgt(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__gt(this.memory.cell(op2), this.memory.cell(op3)))
	}

	sgtz(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__gt(this.memory.cell(op2), 0))
	}

	sle(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__le(this.memory.cell(op2), this.memory.cell(op3)))
	}

	slez(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__le(this.memory.cell(op2), 0))
	}

	slt(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__lt(this.memory.cell(op2), this.memory.cell(op3)))
	}

	sltz(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__lt(this.memory.cell(op2), 0))
	}

	sne(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ne(this.memory.cell(op2), this.memory.cell(op3)))
	}

	snez(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ne(this.memory.cell(op2), 0))
	}

	sap(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ap(this.memory.cell(op2), this.memory.cell(op3)))
	}

	sapz(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__ap(this.memory.cell(op2), 0))
	}

	sna(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__na(this.memory.cell(op2), this.memory.cell(op3), this.memory.cell(op4)))
	}

	snaz(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__na(this.memory.cell(op2), 0, this.memory.cell(op3)))
	}

	sdse(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__dse(op2))
	}

	sdns(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.__dns(op2))
	}

	beq(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	beqz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	bge(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bgez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	bgt(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bgtz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	ble(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	blez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	blt(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bltz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	bne(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bnez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), 0)) {
			this.j(op2)
		}
	}

	bap(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.j(op4)
		}
	}

	bapz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), 0, this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bna(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.j(op4)
		}
	}

	bnaz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
			this.j(op3)
		}
	}

	bdse(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dse(op2)) {
			this.j(op3)
		}
	}

	bdns(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dns(op2)) {
			this.j(op3)
		}
	}

	breq(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	breqz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1))) {
			this.jr(op2)
		}
	}

	brge(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brgez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), 0)) {
			this.jr(op2)
		}
	}

	brgt(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brgtz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), 0)) {
			this.jr(op2)
		}
	}

	brle(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brlez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), 0)) {
			this.jr(op2)
		}
	}

	brlt(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brltz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), 0)) {
			this.jr(op2)
		}
	}

	brne(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brnez(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), 0)) {
			this.jr(op2)
		}
	}

	brap(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.jr(op4)
		}
	}

	brapz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), 0, this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brna(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.jr(op4)
		}
	}

	brnaz(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
			this.jr(op3)
		}
	}

	brdse(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dse(op2)) {
			this.jr(op3)
		}
	}

	brdns(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dns(op2)) {
			this.jr(op3)
		}
	}

	beqal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	beqzal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__eq(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bgeal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	bgezal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ge(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bgtal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	bgtzal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__gt(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bleal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	blezal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__le(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bltal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	bltzal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__lt(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bneal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	bnezal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ne(this.memory.cell(op1), 0)) {
			this.jal(op2)
		}
	}

	bapal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.jal(op4)
		}
	}

	bapzal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__ap(this.memory.cell(op1), 0) && this.memory.cell(op2)) {
			this.jal(op3)
		}
	}

	bnaal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), this.memory.cell(op2), this.memory.cell(op3))) {
			this.jal(op4)
		}
	}

	bnazal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__na(this.memory.cell(op1), 0, this.memory.cell(op2))) {
			this.jal(op3)
		}
	}

	bdseal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dse(op2)) {
			this.jal(op3)
		}
	}

	bdnsal(op1: any, op2: any, op3: any, op4: any) {
		if (this.__dns(op2)) {
			this.jal(op3)
		}
	}

	push(op1: any, op2: any, op3: any, op4: any) {
		this.memory.getCell('r16').push(op1)
	}

	pop(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.getCell('r16').pop())
	}

	peek(op1: any, op2: any, op3: any, op4: any) {
		this.memory.cell(op1, this.memory.getCell('r16').peek())
	}

	lb(op1: any, op2: any, op3: any, op4: any) {
		const values = [];
		const hash   = this.memory.cell(op2);
		for (let i = 0; i <= 5; i++) {
			const d: MemoryCell | MemoryStack | Device | number = this.memory.getCell('d' + i);
			if (d instanceof Device) {
				if (d.hash == hash) {
					values.push(d.get(op3))
				}
			}
		}
		if (values.length === 0) {
			throw Execution.error(this.position, 'Can`t find Device wich hash:', hash)
		}
		let result = 0;
		switch (op4) {
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
		this.memory.cell(op1, Number(result))
	}

	lr(op1: any, op2: any, op3: any, op4: any) {
		const values = [];
		const d      = this.memory.getCell(op2);
		if (d instanceof Device) {
			for (const slotsKey in d.properties.slots) {
				if (d.properties.slots[slotsKey] instanceof Slot) {
					const slot: Slot = d.properties.slots[slotsKey];
					values.push(slot.get(op4))
				}
			}
		}
		let result = 0;
		switch (op3) {
			case 0:
			case 'Average':
				result = values.reduce((partial_sum, a) => partial_sum + a, 0) / values.length
				break;
			case 1:
			case 'Sum':
				result = values.reduce((partial_sum, a) => partial_sum + a, 0)
				break;
			case 2:
			case 'Minimum':
				result = Math.min.apply(null, values)
				break;
			case 3:
			case 'Maximum':
				result = Math.max.apply(null, values)
				break;

		}
		this.memory.cell(op1, result)
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

	and(op1: any, op2: any, op3: any, op4: any) {
		op2 = this.memory.cell(op2)
		op3 = this.memory.cell(op3)
		if (op2 && op3) {
			this.memory.cell(op1, 1)
		} else {
			this.memory.cell(op1, 0)
		}
	}

	or(op1: any, op2: any, op3: any, op4: any) {
		op2 = this.memory.cell(op2)
		op3 = this.memory.cell(op3)
		if (op2 || op3) {
			this.memory.cell(op1, 1)
		} else {
			this.memory.cell(op1, 0)
		}
	}

	xor(op1: any, op2: any, op3: any, op4: any) {
		op2 = Boolean(this.memory.cell(op2))
		op3 = Boolean(this.memory.cell(op3))
		if ((op2 && !op3) || (!op2 && op3)) {
			this.memory.cell(op1, 1)
		} else {
			this.memory.cell(op1, 0)
		}
	}

	nor(op1: any, op2: any, op3: any, op4: any) {
		op2 = Boolean(this.memory.cell(op2))
		op3 = Boolean(this.memory.cell(op3))
		if (!op2 && !op3) {
			this.memory.cell(op1, 1)
		} else {
			this.memory.cell(op1, 0)
		}
	}

	_log() {
		const out = [];
		try {
			for (const argumentsKey in arguments) {
				if (arguments.hasOwnProperty(argumentsKey)) {
					let key = arguments[argumentsKey];
					if (typeof key == 'string') {
						let keys = key.split('.');
						try {
							let cells   = Object.keys(this.memory.cells);
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
					} else {
						try {
							out.push(key + '; ')
						} catch (e) {
						}
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