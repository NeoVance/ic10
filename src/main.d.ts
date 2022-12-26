import { ic10Error } from "./ic10Error";
import { Memory } from "./Memory";
export declare const regexes: {
    rr1: RegExp;
    r1: RegExp;
    d1: RegExp;
    rr: RegExp;
    strStart: RegExp;
    strEnd: RegExp;
};
export declare var Execution: {
    error(code: number, message: string, obj?: any): ic10Error;
    display: (e: {
        code: any;
        message: any;
        lvl: any;
        obj: any;
    }) => string | {
        code: any;
        message: any;
        lvl: any;
        obj: any;
    };
};
export declare class InterpreterIc10 {
    code: string;
    commands: {
        command: string | undefined;
        args: string[];
    }[];
    lines: string[];
    memory: Memory;
    position: number;
    interval: any;
    labels: {
        [key: string]: number;
    };
    constants: {};
    output: {
        debug: string;
        log: string;
        error: string;
    };
    settings: {
        debug: boolean;
        debugCallback: Function;
        logCallback: Function;
        executionCallback: Function;
        tickTime: number;
    };
    ignoreLine: Array<number>;
    constructor(code?: string, settings?: {});
    setSettings(settings?: object): InterpreterIc10;
    init(text: string): InterpreterIc10;
    stop(): InterpreterIc10;
    run(): Promise<unknown>;
    prepareLine(line?: number, isDebugger?: boolean): string | true;
    __issetLabel(x: string): boolean;
    define(op1: any, op2: any, op3: any, op4: any): void;
    alias(op1: any, op2: any, op3: any, op4: any): void;
    l(op1: any, op2: any, op3: any, op4: any): void;
    __l(op1: any, op2: any, op3: any, op4: any): void;
    ls(op1: any, op2: any, op3: any, op4: any): void;
    s(op1: any, op2: any, op3: any, op4: any): void;
    __s(op1: any, op2: any, op3: any, op4: any): void;
    move(op1: any, op2: any, op3: any, op4: any): void;
    __move(op1: any, op2: any, op3: any, op4: any): void;
    add(op1: any, op2: any, op3: any, op4: any): void;
    sub(op1: any, op2: any, op3: any, op4: any): void;
    mul(op1: any, op2: any, op3: any, op4: any): void;
    div(op1: any, op2: any, op3: any, op4: any): void;
    mod(op1: any, op2: any, op3: any, op4: any): void;
    sqrt(op1: any, op2: any, op3: any, op4: any): void;
    round(op1: any, op2: any, op3: any, op4: any): void;
    trunc(op1: any, op2: any, op3: any, op4: any): void;
    ceil(op1: any, op2: any, op3: any, op4: any): void;
    floor(op1: any, op2: any, op3: any, op4: any): void;
    max(op1: any, op2: any, op3: any, op4: any): void;
    min(op1: any, op2: any, op3: any, op4: any): void;
    abs(op1: any, op2: any, op3: any, op4: any): void;
    log(op1: any, op2: any, op3: any, op4: any): void;
    exp(op1: any, op2: any, op3: any, op4: any): void;
    rand(op1: any, op2: any, op3: any, op4: any): void;
    sin(op1: any, op2: any, op3: any, op4: any): void;
    cos(op1: any, op2: any, op3: any, op4: any): void;
    tan(op1: any, op2: any, op3: any, op4: any): void;
    asin(op1: any, op2: any, op3: any, op4: any): void;
    acos(op1: any, op2: any, op3: any, op4: any): void;
    atan(op1: any, op2: any, op3: any, op4: any): void;
    atan2(op1: any, op2: any, op3: any, op4: any): void;
    yield(op1: any, op2: any, op3: any, op4: any): void;
    sleep(op1: any, op2: any, op3: any, op4: any): void;
    select(op1: any, op2: any, op3: any, op4: any): void;
    hcf(op1: any, op2: any, op3: any, op4: any): void;
    j(op1: any): void;
    jr(op1: any): void;
    jal(op1: any): void;
    __eq(op1?: number, op2?: number): number;
    __ge(op1?: number, op2?: number): number;
    __gt(op1?: number, op2?: number): number;
    __le(op1?: number, op2?: number): number;
    __lt(op1?: number, op2?: number): number;
    __ne(op1?: number, op2?: number): number;
    __ap(op1?: number, op2?: number, op3?: number, op4?: number): number;
    __na(x?: number, y?: number, d?: number, op4?: number): number;
    __dse(op1?: number, op2?: number, op3?: number, op4?: number): 0 | 1;
    __dns(op1?: number, op2?: number, op3?: number, op4?: number): 0 | 1;
    seq(op1: any, op2: any, op3: any, op4: any): void;
    seqz(op1: any, op2: any, op3: any, op4: any): void;
    sge(op1: any, op2: any, op3: any, op4: any): void;
    sgez(op1: any, op2: any, op3: any, op4: any): void;
    sgt(op1: any, op2: any, op3: any, op4: any): void;
    sgtz(op1: any, op2: any, op3: any, op4: any): void;
    sle(op1: any, op2: any, op3: any, op4: any): void;
    slez(op1: any, op2: any, op3: any, op4: any): void;
    slt(op1: any, op2: any, op3: any, op4: any): void;
    sltz(op1: any, op2: any, op3: any, op4: any): void;
    sne(op1: any, op2: any, op3: any, op4: any): void;
    snez(op1: any, op2: any, op3: any, op4: any): void;
    sap(op1: any, op2: any, op3: any, op4: any): void;
    sapz(op1: any, op2: any, op3: any, op4: any): void;
    sna(op1: any, op2: any, op3: any, op4: any): void;
    snaz(op1: any, op2: any, op3: any, op4: any): void;
    sdse(op1: any, op2: any, op3: any, op4: any): void;
    sdns(op1: any, op2: any, op3: any, op4: any): void;
    beq(op1: any, op2: any, op3: any, op4: any): void;
    beqz(op1: any, op2: any, op3: any, op4: any): void;
    bge(op1: any, op2: any, op3: any, op4: any): void;
    bgez(op1: any, op2: any, op3: any, op4: any): void;
    bgt(op1: any, op2: any, op3: any, op4: any): void;
    bgtz(op1: any, op2: any, op3: any, op4: any): void;
    ble(op1: any, op2: any, op3: any, op4: any): void;
    blez(op1: any, op2: any, op3: any, op4: any): void;
    blt(op1: any, op2: any, op3: any, op4: any): void;
    bltz(op1: any, op2: any, op3: any, op4: any): void;
    bne(op1: any, op2: any, op3: any, op4: any): void;
    bnez(op1: any, op2: any, op3: any, op4: any): void;
    bap(op1: any, op2: any, op3: any, op4: any): void;
    bapz(op1: any, op2: any, op3: any, op4: any): void;
    bna(op1: any, op2: any, op3: any, op4: any): void;
    bnaz(op1: any, op2: any, op3: any, op4: any): void;
    bdse(op1: any, op2: any, op3: any, op4: any): void;
    bdns(op1: any, op2: any, op3: any, op4: any): void;
    breq(op1: any, op2: any, op3: any, op4: any): void;
    breqz(op1: any, op2: any, op3: any, op4: any): void;
    brge(op1: any, op2: any, op3: any, op4: any): void;
    brgez(op1: any, op2: any, op3: any, op4: any): void;
    brgt(op1: any, op2: any, op3: any, op4: any): void;
    brgtz(op1: any, op2: any, op3: any, op4: any): void;
    brle(op1: any, op2: any, op3: any, op4: any): void;
    brlez(op1: any, op2: any, op3: any, op4: any): void;
    brlt(op1: any, op2: any, op3: any, op4: any): void;
    brltz(op1: any, op2: any, op3: any, op4: any): void;
    brne(op1: any, op2: any, op3: any, op4: any): void;
    brnez(op1: any, op2: any, op3: any, op4: any): void;
    brap(op1: any, op2: any, op3: any, op4: any): void;
    brapz(op1: any, op2: any, op3: any, op4: any): void;
    brna(op1: any, op2: any, op3: any, op4: any): void;
    brnaz(op1: any, op2: any, op3: any, op4: any): void;
    brdse(op1: any, op2: any, op3: any, op4: any): void;
    brdns(op1: any, op2: any, op3: any, op4: any): void;
    beqal(op1: any, op2: any, op3: any, op4: any): void;
    beqzal(op1: any, op2: any, op3: any, op4: any): void;
    bgeal(op1: any, op2: any, op3: any, op4: any): void;
    bgezal(op1: any, op2: any, op3: any, op4: any): void;
    bgtal(op1: any, op2: any, op3: any, op4: any): void;
    bgtzal(op1: any, op2: any, op3: any, op4: any): void;
    bleal(op1: any, op2: any, op3: any, op4: any): void;
    blezal(op1: any, op2: any, op3: any, op4: any): void;
    bltal(op1: any, op2: any, op3: any, op4: any): void;
    bltzal(op1: any, op2: any, op3: any, op4: any): void;
    bneal(op1: any, op2: any, op3: any, op4: any): void;
    bnezal(op1: any, op2: any, op3: any, op4: any): void;
    bapal(op1: any, op2: any, op3: any, op4: any): void;
    bapzal(op1: any, op2: any, op3: any, op4: any): void;
    bnaal(op1: any, op2: any, op3: any, op4: any): void;
    bnazal(op1: any, op2: any, op3: any, op4: any): void;
    bdseal(op1: any, op2: any, op3: any, op4: any): void;
    bdnsal(op1: any, op2: any, op3: any, op4: any): void;
    push(op1: any, op2: any, op3: any, op4: any): void;
    pop(op1: any, op2: any, op3: any, op4: any): void;
    peek(op1: any, op2: any, op3: any, op4: any): void;
    lb(op1: any, op2: any, op3: any, op4: any): void;
    lr(op1: any, op2: any, op3: any, op4: any): void;
    sb(op1: any, op2: any, op3: any, op4: any): void;
    and(op1: any, op2: any, op3: any, op4: any): void;
    or(op1: any, op2: any, op3: any, op4: any): void;
    xor(op1: any, op2: any, op3: any, op4: any): void;
    nor(op1: any, op2: any, op3: any, op4: any): void;
    _log(): void;
    _d0(op1: any): void;
    _d1(op1: any): void;
    _d2(op1: any): void;
    _d3(op1: any): void;
    _d4(op1: any): void;
    _d5(op1: any): void;
    __d(device: string, args: any): void;
    __debug(p: string, iArguments: string[]): void;
}
export default InterpreterIc10;