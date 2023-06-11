import { Ic10Error } from "./Ic10Error";
import { Memory } from "./Memory";
import { Device } from "./devices/Device";
import { Scope, ScopeSettings } from "./commands/core";
export type ReturnCode = "hcf" | "end" | "die";
export declare const Execution: {
    display: (e: Ic10Error | any) => any;
};
export declare class InterpreterIc10 implements Scope {
    code: string;
    commands: {
        command: string | undefined;
        args: string[];
    }[];
    lines: string[];
    memory: Memory;
    position: number;
    interval: any;
    labels: Record<string, number>;
    constants: {};
    output: {
        debug: string;
        log: string;
        error: string;
    };
    settings: ScopeSettings;
    ignoreLine: Array<number>;
    device?: Device;
    sleeping: number;
    private readonly debugCommands;
    private readonly inGameCommands;
    constructor(code?: string, settings?: Partial<ScopeSettings>);
    setSettings(settings?: Partial<ScopeSettings>): InterpreterIc10;
    getSettings(): ScopeSettings;
    init(text: string, device?: Device): InterpreterIc10;
    splitString(str: string): string[];
    stop(): InterpreterIc10;
    run(): Promise<unknown>;
    prepareLine(line?: number, isDebugger?: boolean): ReturnCode | true;
    runUntilSync(cond: (status: true | ReturnCode) => boolean, maxIterations?: number): number;
    private debug;
    private updateDevice;
}
export default InterpreterIc10;
