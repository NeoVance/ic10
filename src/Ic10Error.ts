export class Ic10Error extends Error {
    public obj: any
    public lvl: number
    public line: number

    constructor(message: string, obj?: any, lvl: number = 0, info?: {cause: Error, line: number}) {
        super((!(obj instanceof Object) && obj !== undefined) ? `${message}: ${obj}` : message, info !== undefined ? { cause: info.cause } : undefined);
        this.obj = obj
        this.lvl = lvl
        this.line = info?.line ?? 0
    }
}

// Class for vsCode code analyser
export class Ic10DiagnosticError extends Ic10Error {}

export const keywordErrorMsg = (target: string) => `Expected ${target}, got keyword`