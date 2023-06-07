export declare class Ic10Error extends Error {
    obj: any;
    lvl: number;
    line: number;
    constructor(message: string, obj?: any, lvl?: number, info?: {
        cause: Error;
        line: number;
    });
}
export declare class Ic10DiagnosticError extends Ic10Error {
}
