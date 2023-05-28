import {ValueCell} from "./ValueCell";

export class RegisterCell extends ValueCell {
	constructor(name: string) {
        super(0, name)
	}
}