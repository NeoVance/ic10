export class Ic10Error extends Error {
    public obj: any
    public lvl: number
    public line: number

    constructor(message: string, obj?: any, lvl: number = 0) {
        super((!(obj instanceof Object) && obj !== undefined) ? `${message}: ${obj}` : message);
        this.obj = obj
        this.lvl = lvl
        this.line = 0
    }
}

// Class for vsCode code analyser
export class Ic10DiagnosticError extends Ic10Error {}

export const keywordErrorMsg = (target: string) => `Expected ${target}, got keyword`