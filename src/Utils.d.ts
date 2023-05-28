export declare const patterns: {
    reg: RegExp;
    dev: RegExp;
    recDev: RegExp;
    strStart: RegExp;
    strEnd: RegExp;
    hash: RegExp;
};
export declare const hashStr: (name: string) => number;
export declare const isHash: (value: string) => boolean;
export declare const isNumber: (value: string) => boolean;
export declare const isPort: (value: string) => boolean;
export declare const isRecPort: (value: string) => boolean;
export declare const isSimplePort: (value: string) => boolean;
export declare const isRegister: (value: string) => boolean;
