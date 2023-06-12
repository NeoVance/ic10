import {Ic10Error} from "../Ic10Error";
import {Memory} from "../Memory";

export type ScopeSettings = {
    debug: boolean;
    debugCallback: (command: string, args: string[]) => void;
    logCallback: (s: string, out: string[]) => void;
    executionCallback: (err: Ic10Error) => void;
    tickTime: number;
}

export interface Scope {
    memory: Memory,
    settings: ScopeSettings,
    position: number
    sleeping: number
    labels: Record<string, number>
}

export type CommandBuilder = (scope: Scope) => Record<string, (...args: string[]) => void>