export declare class Ic10Error extends Error {
    loc?: {
        start: number;
        len: number;
    } | undefined;
    message: string;
    code: number;
    functionName: string;
    lvl: number;
    line: number;
    className: string;
    obj: any;
    constructor(caller: any, code: number, message: string, obj: any, lvl?: number, loc?: {
        start: number;
        len: number;
    } | undefined);
    getCode(): number;
    getMessage(): string;
}
export declare class Ic10DiagnosticError extends Ic10Error {
}
