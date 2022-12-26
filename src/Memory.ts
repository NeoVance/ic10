import InterpreterIc10, {Execution, regexes} from "./main";
import {Environ}                             from "./Environ";
import {MemoryCell}                          from "./MemoryCell";
import {MemoryStack}                         from "./MemoryStack";
import {Device}                              from "./Device";
import {ConstantCell}                        from "./ConstantCell";
import {IntRange}                            from "./types";

export class Memory {
	public cells: Array<MemoryCell | MemoryStack>
	public environ: Environ
	public aliases: { [key: string]: MemoryCell | Device | ConstantCell }
	readonly #scope: InterpreterIc10;

	constructor(scope: InterpreterIc10) {
		this.#scope  = scope;
		this.cells   = new Array<MemoryCell>(15)
		this.environ = new Environ(scope)
		this.aliases = {}

		for (let i = 0; i < 18; i++) {
			if (i === 16) {
				this.cells[i] = new MemoryStack(scope, 'r' + i)
			} else {
				this.cells[i] = new MemoryCell(scope, 'r' + i)
			}
		}
	}

	get scope(): InterpreterIc10 | null {
		return null;
	}

	cell(cell: string | number, op1: any = null, op2: any = null): MemoryCell | any {
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

	getCell(cell: 'sp'): MemoryStack
	getCell(cell: 'r16'): MemoryStack
	getCell(cell: `d${IntRange<0, 6>}`): Device
	getCell(cell: `r${IntRange<0, 16>}`): MemoryCell
	getCell(cell: number): number
	getCell(cell: string | number): MemoryCell | MemoryStack | Device | number
	getCell(cell: any): MemoryCell | MemoryStack | Device | number
	getCell(cell: string | number): MemoryCell | MemoryStack | Device | number {
		if (typeof cell === "string") {
			if (cell == 'sp') return this.cells[16]
			if (cell == 'ra') cell = 'r17'
			if (regexes.rr1.test(cell)) {
				let m = regexes.rr1.exec(cell)
				if (m) {
					const index = cell.replace(m[1], this.cell(m[1])) as `r${IntRange<0, 16>}`
					let m1      = this.getCell(index)
					if (m1) {
						return m1
					}
					throw Execution.error(this.#scope.position, 'Unknown cell', m1)
				}
				throw Execution.error(this.#scope.position, 'Syntax error')

			}
			if (regexes.r1.test(cell)) {
				let m = regexes.r1.exec(cell)
				if (m) {
					const index: number = parseInt(m[1])
					if (index in this.cells) {
						return this.cells[index]
					}
				}
				throw Execution.error(this.#scope.position, 'Syntax error')
			}
			if (regexes.d1.test(cell)) {
				if (cell in this.environ) {
					return this.environ.get(cell)
				} else {
					throw Execution.error(this.#scope.position, 'Unknown cell', cell)
				}
			}
			if (cell in this.aliases) {
				return this.aliases[cell]
			}
			throw Execution.error(this.#scope.position, 'Unknown cell', cell)
		}
		if (cell >= 18) throw Execution.error(this.#scope.position, 'Unknown cell', cell)
		return this.cells[cell]
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