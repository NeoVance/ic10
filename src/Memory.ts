import InterpreterIc10, {Execution} from "./main";
import {Environ}                             from "./Environ";
import {RegisterCell}                          from "./RegisterCell";
import {MemoryStack}                         from "./MemoryStack";
import {Device}                              from "./Device";
import {ConstantCell}                        from "./ConstantCell";
import {hashStr, isHash, isNumber, isPort, isRecPort, isRegister, isSimplePort, patterns} from "./Utils";
import {ValueCell} from "./ValueCell";

export class Memory {
	public cells: Array<RegisterCell>
    public stack: MemoryStack
	public environ: Environ
	public aliases: Record<string, ValueCell | Device>
	readonly #scope: InterpreterIc10;

	constructor(scope: InterpreterIc10) {
		this.#scope  = scope;
		this.cells   = new Array<RegisterCell>(18)
		this.environ = new Environ(scope)
        this.stack = new MemoryStack(scope, 512, "r16")
		this.aliases = {}

		for (let i = 0; i < 18; i++) {
            const n = `r${i}`
			if (i === 16) {
				this.cells[i] = this.stack
			} else {
				this.cells[i] = new RegisterCell(n)
			}
            this.cells[i].value = 0
		}
	}

	get scope(): InterpreterIc10 | null {
		return this.#scope;
	}

    reset() {
        for (let r of this.cells)
            r.value = 0

        this.stack.getStack().fill(0)
        this.aliases = {}
        this.environ = new Environ(this.#scope)
    }

    findRegister(name: string | number): RegisterCell | undefined {
        const mapping: Record<string, string | undefined> = {
            sp: "r16",
            ra: "r17"
        }

        name = mapping[name] ?? name

        if (typeof name === "string")
        {
            if (isRegister(name)) {
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

                if (isRegister(mem.name))
                    return mem as RegisterCell
            }

            return undefined
        }

        if (name >= 18)
            throw Execution.error(this.#scope.position, 'Unknown register', name)

        return this.cells[name]
    }

    getRegister(name: string | number): RegisterCell {
        const reg = this.findRegister(name)

        if (!reg)
            throw Execution.error(this.#scope.position, 'Not a register', name)

        return reg
    }

    findDevice(name: string | number): Device | undefined {
        if (typeof name === "number")
            name = `d${name}`

        if (isSimplePort(name))
            return this.environ.get(name)

        if (isRecPort(name))
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

            if (isPort(mem.name))
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

        if (isHash(value)) {
            const m = patterns.hash.exec(value)

            if (!m)
                throw Execution.error(this.#scope.position, 'Syntax error')

            const hash = m.groups?.hash ?? ""

            return hashStr(hash)
        }

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

        if (!(v instanceof RegisterCell))
            return undefined

        return (v as RegisterCell).value
    }

    getValue(value: string | number): number {
        const v = this.findValue(value)

        if (v === undefined)
            throw Execution.error(this.#scope.position, 'Unknown value', v)

        return v
    }

	alias(name: string | number, link: string): Memory {
        const register = this.findRegister(link)

        if (register !== undefined)
        {
            this.aliases[name] = register
            return this
        }

        const device = this.findDevice(link)

        if (device !== undefined) {
            this.aliases[name] = device
            return this
        }

		throw Execution.error(this.#scope.position, 'Invalid alias value')
	}

	define(name: string, value: string | number) {
        if (typeof value === "string")
        {
            if (!isNumber(value))
                throw Execution.error(this.#scope.position, "")

            value = parseInt(value)
        }

		this.aliases[name] = new ConstantCell(value, name)
	}

	toLog() {
		const out: { [key: string]: any } = {};
		for (let i = 0; i < 18; i++) {
			if (i === 16) {
				out['r' + i] = this.cells[i].value
			} else {
				out['r' + i] = this.cells[i].value
				out['stack'] = this.cells[i].value
			}
		}
		return out
	}
}