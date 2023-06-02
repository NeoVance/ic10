export class Ic10Error extends Error {
	public message: string;
	public code: number;
	public functionName: string;
	public lvl: number;
	public line: number;
	public className: string;
	public obj: any;

	constructor(caller: any, code: number, message: string, obj: any, lvl: number = 0) {
        super(message);
        this.message      = message;
		this.code         = code;
		this.obj          = obj;
		this.lvl          = lvl;
		this.className    = caller?.typeName ?? ''
		this.functionName = caller?.functionName ?? caller?.methodName ?? '';
		this.line         = caller?.lineNumber ?? 0;
	}

	getCode(): number {
		return this.code
	}

	getMessage(): string {
		return this.message
	}
}

export class Ic10DiagnosticError extends Ic10Error {

}
