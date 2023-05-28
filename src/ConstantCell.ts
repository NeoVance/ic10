import InterpreterIc10, {Execution} from "./main";
import {RegisterCell}                 from "./RegisterCell";
import {ValueCell} from "./ValueCell";

export class ConstantCell extends ValueCell {
	declare public readonly value: number

	constructor(value: number, name: string) {
        super(value, name)
	}
}