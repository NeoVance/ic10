import InterpreterIc10 from "./main";
export declare class MemoryCell {
    value: number;
    name: string;
    alias: string | number | null;
    private scope;
    constructor(scope: InterpreterIc10, name: string);
    getName(): string | number;
}
