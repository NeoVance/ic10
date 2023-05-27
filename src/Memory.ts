import InterpreterIc10, {Execution, regexes} from "./main";
import {Environ}                             from "./Environ";
import {MemoryCell}                          from "./MemoryCell";
import {MemoryStack}                         from "./MemoryStack";
import {Device}                              from "./Device";
import {ConstantCell}                        from "./ConstantCell";
import {patterns} from "./Utils";

export class Memory {
	public cells: Array<MemoryCell | MemoryStack>
    public stack: MemoryStack
	public environ: Environ
	public aliases: Record<string, MemoryCell | Device | ConstantCell>
	readonly #scope: InterpreterIc10;

	constructor(scope: InterpreterIc10) {
		this.#scope  = scope;
		this.cells   = new Array<MemoryCell>(18)
		this.environ = new Environ(scope)
        this.stack = new MemoryStack(scope, 512, "r16")
		this.aliases = {}

		for (let i = 0; i < 18; i++) {
            const n = `r${i}`
			if (i === 16) {
				this.cells[i] = this.stack
			} else {
				this.cells[i] = new MemoryCell(scope, n)
			}
            this.cells[i].value = 0
		}
	}

	get scope(): InterpreterIc10 | null {
		return this.#scope;
	}

	cell(cell: string | number, op1: any = null, op2: any = null): any {
		if (typeof cell === "string") {
			if (cell == 'sp') cell = 'r16'
			if (cell == 'ra') cell = 'r17'
			if (regexes.rr1.test(cell)) {
				let m = regexes.rr1.exec(cell)
				if (m) {
					let m1 = this.cell(cell.replace(m[1], this.cell(m[1])), op1, op2) ?? false
					if (m1 !== false) {
						return m1
					}
					throw Execution.error(this.#scope.position, 'Unknown cell', m1)
				}
				throw Execution.error(this.#scope.position, 'Syntax error')

			}
			if (regexes.r1.test(cell)) {
				let m = regexes.r1.exec(cell)
				if (m && m[1] in this.cells) {
					const index = parseInt(m[1]);
					if (op1 === null) {
						return this.cells[index].get()
					} else {
						return this.cells[index].set(null, this.cell(op1))
					}
				} else {
					throw Execution.error(this.#scope.position, 'Unknown cell', cell)
				}
			}
			if (regexes.d1.test(cell)) {
				if (cell in this.environ) {
					if (op1 === null) {
						throw Execution.error(this.#scope.position, 'Have not `Port`', cell)
					} else {
						if (op2 !== null) {
							return this.environ.get(cell)?.set(op1, this.cell(op2))
						}
						return this.environ.get(cell)?.get(op1)
					}
				} else {
					throw Execution.error(this.#scope.position, 'Unknown cell', cell)
				}
			}
			if (cell in this.aliases) {
				if (this.aliases[cell].constructor.name === 'MemoryCell') {
					if (op1 === null) {
						return this.aliases[cell].get(null)
					} else {
						return this.aliases[cell].set(null, this.cell(op1))
					}
				} else if (this.aliases[cell] instanceof Device) {
					if (op1 === null) {
						throw Execution.error(this.#scope.position, 'Have not `Port`', cell)
					} else {
						if (op2 !== null) {
							return this.aliases[cell].set(op1, this.cell(op2))
						}
						return this.aliases[cell].get(op1)
					}
				} else if (this.aliases[cell] instanceof ConstantCell) {
					return this.aliases[cell].get(null)
				} else {
					throw Execution.error(this.#scope.position, 'Unknown cell', cell)
				}
			}
			if (String(cell).trim().match(/[\d/.]+/)) {
				return parseFloat(cell)
			}
			throw Execution.error(this.#scope.position, 'Unknown cell', cell)
		}
		return cell
	}

	getCell(cell: string | number): MemoryCell | MemoryStack | Device | number {
        const reg = this.findRegister(cell)

        if (reg)
            return reg

        const device = this.findDevice(cell)

        if (device)
            return device

		if (typeof cell === "string" && cell in this.aliases)
            return this.aliases[cell]

        throw Execution.error(this.#scope.position, 'Unknown cell', cell)
	}

    findRegister(name: string | number): MemoryCell | undefined {
        const mapping: Record<string, string | undefined> = {
            sp: "r16",
            ra: "r17"
        }

        name = mapping[name] ?? name

        if (typeof name === "string")
        {
            if (patterns.reg.test(name)) {
                let m = patterns.reg.exec(name)

                if (!m)
                    throw Execution.error(this.#scope.position, 'Syntax error')

                const prefix = m.groups?.prefix ?? ""
                const indexStr = m.groups?.index ?? "none"

                const index: number = parseInt(indexStr)

                let cell = this.cells[index]
                for (let i = 0; i<prefix.length; ++i) {
                    cell = this.cells[cell.value]

                    if (cell === undefined)
                        break
                }

                if (cell !== undefined)
                    return cell
            }

            if (name in this.aliases) {
                const mem = this.aliases[name]

                if (patterns.reg.test(mem.name))
                    return mem
            }

            return undefined
        }

        if (name >= 18)
            throw Execution.error(this.#scope.position, 'Unknown register', name)

        return this.cells[name]
    }

    getRegister(name: string | number): MemoryCell {
        const reg = this.findRegister(name)

        if (!reg)
            throw Execution.error(this.#scope.position, 'Not a register', name)

        return reg
    }

    findDevice(name: string | number): Device | undefined {
        if (typeof name === "number")
            name = `d${name}`

        if (patterns.dev.test(name))
            return this.environ.get(name)

        if (patterns.recDev.test(name))
        {
            const m = patterns.recDev.exec(name)

            if (!m)
                throw Execution.error(this.#scope.position, 'Syntax error')

            const prefix = (m.groups?.prefix ?? "")
            const indexStr = m.groups?.index ?? "none"

            const index = this.getRegister(`${prefix}${indexStr}`).value

            return this.environ.get(`d${index}`)
        }

        if (name in this.aliases) {
            const mem = this.aliases[name]

            if (patterns.dev.test(mem.name))
                return mem as Device
        }

        return undefined
    }

    getDevice(name: string | number): Device {
        const device = this.findDevice(name)

        if (!device)
            throw Execution.error(this.#scope.position, 'Unknown device', name)

        return device
    }

    findValue(value: string | number): number | undefined {
        if (typeof value === "number")
            return value

        const n = Number(value)
        if (!isNaN(n))
            return n

        const v = this.aliases[value]

        if (!v)
        {
            const r = this.findRegister(value)

            if (r)
                return r.value

            return undefined
        }

        if (typeof (v.value) !== "number")
            return undefined

        return v.value
    }

    getValue(value: string | number): number {
        const v = this.findValue(value)

        if (v === undefined)
            throw Execution.error(this.#scope.position, 'Unknown value', v)

        return v
    }

	alias(name: string | number, link: string | number) {
		const result = this.getCell(link)
		if (typeof result !== 'number') {
			this.aliases[name] = result
			if (this.aliases[name] instanceof MemoryCell) {
				this.aliases[name].alias = name;
			}
			return this
		}
		throw Execution.error(this.#scope.position, 'Invalid alias value')
	}

	define(name: string, value: string | number) {
        if (typeof value === "string")
            value = parseInt(value)

		this.aliases[name] = new ConstantCell(value, this.#scope, name)
	}

	toLog() {
		const out: { [key: string]: any } = {};
		for (let i = 0; i < 18; i++) {
			if (i === 16) {
				out['r' + i] = this.cells[i].get()
			} else {
				out['r' + i] = this.cells[i].get()
				out['stack'] = this.cells[i].value
			}
		}
		return out
	}
}