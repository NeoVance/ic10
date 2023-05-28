import { ValueCell } from "./ValueCell";
export declare class ConstantCell extends ValueCell {
    readonly value: number;
    constructor(value: number, name: string);
}
