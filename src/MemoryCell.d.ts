import InterpreterIc10 from "./main";
export declare class MemoryCell {
    value: number;
    name: string;
    private scope;
    constructor(scope: InterpreterIc10, name: string);
}
