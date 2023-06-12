import { Scope } from "./core";
export declare const makeConditions: (scope: Scope) => {
    eq: (a: number, b?: number) => boolean;
    ge: (a: number, b?: number) => boolean;
    gt: (a: number, b?: number) => boolean;
    le: (a: number, b?: number) => boolean;
    lt: (a: number, b?: number) => boolean;
    ne: (a: number, b?: number) => boolean;
    ap: (x: number, y: number, c?: number) => boolean;
    na: (x: number, y: number, c?: number) => boolean;
    dse: (d: string) => boolean;
    dns: (d: string) => boolean;
    nan: (v: number) => boolean;
    nanz: (v: number) => boolean;
};
export type Conditions = ReturnType<typeof makeConditions>;
