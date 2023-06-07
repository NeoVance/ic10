import {Scope} from "./core";
import {Conditions} from "./conditions";

export const makeSelectCommands = (scope: Scope, conditions: Conditions) => {
    const cd = conditions
    function __sOp<Args extends number[]>(op: (...args: Args) => boolean, register: string, ...args: { [K in keyof Args]: string }) {
        const r = scope.memory.getRegister(register)

        const inputs = args.map(v => scope.memory.getValue(v)) as Args

        r.value = op(...inputs) ? 1 : 0
    }

    /*
    * @seq@
    * [en] If op2 = op3, then one, otherwise zero
    * [ru] Если op2 = op3, то единица, иначе ноль
    */
    const seq = (register: string, a: string, b: string) => {
        __sOp(cd.eq, register, a, b)
    }

    /*
    * @seqz@
    * [en] If op2 = 0, then one, otherwise zero
    * [ru] Если op2 = 0, то единица, иначе ноль
    */
    const seqz = (register: string, a: string) => {
        __sOp(cd.eq, register, a)
    }

    /*
    * @sge@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    const sge = (register: string, a: string, b: string) => {
        __sOp(cd.ge, register, a, b)
    }

    /*
    * @sgez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    const sgez = (register: string, a: string) => {
        __sOp(cd.ge, register, a)
    }

    /*
    * @sgt@
    * [en] If op2 > op3, then one, otherwise zero
    * [ru] Если op2 > op3, то единица, иначе ноль
    */
    const sgt = (register: string, a: string, b: string) => {
        __sOp(cd.gt, register, a, b)
    }

    /*
    * @sgtz@
    * [en] If op2 > 0, then one, otherwise zero
    * [ru] Если op2 > 0, то единица, иначе ноль
    */
    const sgtz = (register: string, a: string) => {
        __sOp(cd.gt, register, a)
    }

    /*
    * @sle@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    const sle = (register: string, a: string, b: string) => {
        __sOp(cd.le, register, a, b)
    }

    /*
    * @slez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    const slez = (register: string, a: string) => {
        __sOp(cd.le, register, a)
    }

    /*
    * @slt@
    * [en] If op2 < op3, then one, otherwise zero
    * [ru] Если op2 < op3, то единица, иначе ноль
    */
    const slt = (register: string, a: string, b: string) => {
        __sOp(cd.lt, register, a, b)
    }

    /*
    * @sltz@
    * [en] If op2 < 0, then one, otherwise zero
    * [ru] Если op2 < 0, то единица, иначе ноль
    */
    const sltz = (register: string, a: string) => {
        __sOp(cd.lt, register, a)
    }

    /*
    * @sne@
    * [en] If op2 op3, then one, otherwise zero
    * [ru] Если op2 op3, то единица, иначе ноль
    */
    const sne = (register: string, a: string, b: string) => {
        __sOp(cd.ne, register, a, b)
    }

    /*
    * @snez@
    * [en] If op2 0, then one, otherwise zero
    * [ru] Если op2 0, то единица, иначе ноль
    */
    const snez = (register: string, a: string) => {
        __sOp(cd.ne, register, a)
    }

    /*
    * @sap@
    * [en] If op2 op3 with precision op4, then one, otherwise zero
    * [ru] Если op2 op3 с точностью op4, то единица, иначе ноль
    */
    const sap = (register: string, x: string, y: string, c: string) => {
        __sOp(cd.ap, register, x, y, c)
    }

    /*
    * @sapz@
    * [en] If op2 0 with precision op3, then one, otherwise zero
    * [ru] Если op2 0 с точностью op3, то единица, иначе ноль
    */
    const sapz = (register: string, x: string, y: string) => {
        __sOp(cd.ap, register, x, y)
    }

    /*
    * @sna@
    * [en] If op2 op3 with precision op4, then one, otherwise zero
    * [ru] Если op2 op3 с точностью op4, то единица, иначе ноль
    */
    const sna = (register: string, x: string, y: string, c: string) => {
        __sOp(cd.na, register, x, y, c)
    }

    /*
    * @snaz@
    * [en] If op2 0 with precision op3, then one, otherwise zero
    * [ru] Если op2 0 с точностью op3, то единица, иначе ноль
    */
    const snaz = (register: string, x: string, y: string) => {
        __sOp(cd.na, register, x, y)
    }

    /*
    * @sdse@
    * [en] If channel op2 is set to one, otherwise zero
    * [ru] Если канал op2 настроен на то единица, иначе ноль
    */
    const sdse = (register: string, d: string) => {
        scope.memory.getRegister(register).value = Number(cd.dse(d))
    }

    /*
    * @sdns@
    * [en] If channel op2 is not set to one, otherwise zero
    * [ru] Если канал op2 не настроен на то единица, иначе ноль
    */
    const sdns = (register: string, d: string) => {
        scope.memory.getRegister(register).value = Number(cd.dns(d))
    }

    /*
    * @snan@
    * [en]
    * [ru] op1 равно 1, если op2 не имеет значения.
    */
    const snan = (register: string, v: string) => {
        __sOp(cd.nan, register, v)
    }

    /*
    * @snanz@
    * [en]
    * [ru] op1 равно 0, если op2 не имеет значения.
    */
    const snanz = (register: string, v: string) => {
        __sOp(cd.nanz, register, v)
    }

    return {
        seq, seqz, sge, sgez, sgt, sgtz, sle, slez, slt, sltz, sne, snez, sap, sapz, sna, snaz, sdse, sdns, snan, snanz
    }
}