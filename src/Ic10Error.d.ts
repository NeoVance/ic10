export declare class Ic10Error extends Error {
    message: string;
    code: number;
    functionName: string;
    lvl: number;
    line: number;
    className: string;
    obj: any;
    constructor(caller: any, code: number, message: string, obj: any, lvl?: number);
    getCode(): number;
    getMessage(): string;
}
