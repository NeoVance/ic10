import {Scope} from "./core";
import {Conditions} from "./conditions";
import {Ic10DiagnosticError, Ic10Error} from "../Ic10Error";

export const makeJumpCommands = (scope: Scope, conditions: Conditions) => {
    const cd = conditions

    const __jump = (line: number) => scope.position = line

    const __call = (line: number) => {
        scope.memory.getRegister("ra").value = scope.position
        __jump(line)
    }

    const __issetLabel = (x: string) => x in scope.labels

    const __getJumpTarget = (target: string) => {
        if (__issetLabel(target))
            return scope.labels[target]

        const line = scope.memory.getValue(target);

        if (isNaN(line))
            throw new Ic10DiagnosticError('Incorrect jump target', target)

        return line
    }

    /*
    * @j@
    * [en] Jump to the specified line
    * [ru] Переход на указанную строку
    */
    const j = (target: string) => __jump(__getJumpTarget(target))

    /*
    * @jr@
    * [en] Relative jump to +op1
    * [ru] Относительный переход на +op1
    */
    const jr = (offset: string) => {
        const d = scope.memory.getValue(offset)

        if (Math.abs(d) < 0.001)
            throw new Ic10Error('Infinite loop detected caused by', offset)

        __jump(scope.position + d - 1)
    }

    /*
    * @jal@
    * [en] Jump to op1, writing the address of the next line to ra
    * [ru] Переход на op1 с записью адреса следующей строки в ra
    */
    const jal = (target: string) => __call(__getJumpTarget(target))

    function __bOp<Args extends number[]>(op: (...args: Args) => boolean | undefined, line: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => scope.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        j(line)
    }

    function __bROp<Args extends number[]>(op: (...args: Args) => boolean | undefined, offset: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => scope.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        jr(offset)
    }

    function __bCOp<Args extends number[]>(op: (...args: Args) => boolean | undefined, line: string, ...args: { [K in keyof Args]: string }) {
        const inputs = args.map(v => scope.memory.getValue(v)) as Args

        if (!op(...inputs))
            return

        jal(line)
    }

    /*
    * @beq@
    * [en] Jump to op3 if op1 = op2
    * [ru] Переход на op3, если op1 = op2
    */
    const beq = (a: string, b: string, line: string) => __bOp(cd.eq, line, a, b)

    /*
    * @beqz@
    * [en] Jump to op2 if op1 = 0
    * [ru] Переход на op2, если op1 = 0
    */
    const beqz = (a: string, line: string) => __bOp(cd.eq, line, a)

    /*
    * @bge@
    * [en] Jump to op3 if op1 >= op2
    * [ru] Переход на op3, если op1 >= op2
    */
    const bge = (a: string, b: string, line: string) => __bOp(cd.ge, line, a, b)

    /*
    * @bgez@
    * [en] Jump to op2 if op1 >= 0
    * [ru] Переход на op2, если op1 >= 0
    */
    const bgez = (a: string, line: string) => __bOp(cd.ge, line, a)

    /*
    * @bgt@
    * [en] Jump to op3 if op1 > op2
    * [ru] Переход на op3, если op1 > op2
    */
    const bgt = (a: string, b: string, line: string) => __bOp(cd.gt, line, a, b)

    /*
    * @bgtz@
    * [en] Jump to op2 if op1 > 0
    * [ru] Переход на op2, если op1 > 0
    */
    const bgtz = (a: string, line: string) => __bOp(cd.gt, line, a)

    /*
    * @ble@
    * [en] Jump to op3 if op1 <= op2
    * [ru] Переход на op3, если op1 <= op2
    */
    const ble = (a: string, b: string, line: string) => __bOp(cd.le, line, a, b)

    /*
    * @blez@
    * [en] Jump to op2 if op1 <= 0
    * [ru] Переход на op2, если op1 <= 0
    */
    const blez = (a: string, line: string) => __bOp(cd.le, line, a)

    /*
    * @blt@
    * [en] Jump to op3 if op1 < op2
    * [ru] Переход на op3, если op1 < op2
    */
    const blt = (a: string, b: string, line: string) => __bOp(cd.lt, line, a, b)

    /*
    * @bltz@
    * [en] Jump to op2 if op1 < 0
    * [ru] Переход на op2, если op1 < 0
    */
    const bltz = (a: string, line: string) => __bOp(cd.lt, line, a)

    /*
    * @bne@
    * [en] Jump to op3 if op1 != op2
    * [ru] Переход на op3, если op1 != op2
    */
    const bne = (a: string, b: string, line: string) => __bOp(cd.ne, line, a, b)

    /*
    * @bnez@
    * [en] Jump to op2 if op1 != 0
    * [ru] Переход на op2, если op1 != 0
    */
    const bnez = (a: string, line: string) => __bOp(cd.ne, line, a)

    /*
    * @bap@
    * [en] Jump to op4 if op1 op2 with precision op3
    * [ru] Переход на op4, если op1 op2 с точностью op3
    */
    const bap = (x: string, y: string, c: string, line: string) => __bOp(cd.ap, line, x, y, c)

    /*
    * @bapz@
    * [en] Jump to op3 if op1 0 with precision op2s
    * [ru] Переход на op3, если op1 0 с точностью op2
    */
    const bapz = (x: string, y: string, line: string) => __bOp(cd.ap, line, x, y)

    /*
    * @bna@
    * [en] Jump to op4 if op1 ~= op2 with precision op3
    * [ru] Переход на op4, если op1 ~= op2 с точностью op3
    */
    const bna = (x: string, y: string, c: string, line: string) => __bOp(cd.na, line, x, y, c)

    /*
    * @bnaz@
    * [en] Jump to op3 if op1 ~= 0 with precision op2
    * [ru] Переход на op3, если op1 ~= 0 с точностью op2
    */
    const bnaz = (x: string, y: string, line: string) => __bOp(cd.na, line, x, y)

    /*
    * @bdse@
    * [en] Jump to op2 if channel op1 is configured
    * [ru] Переход на op2, если канал op1 настроен
    */
    const bdse = (d: string, line: string) => {
        if (cd.dse(d)) j(line)
    }

    /*
    * @bdns@
    * [en] Jump to op2 if op1 channel is not configured
    * [ru] Переход на op2, если канал op1 не настроен
    */
    const bdns = (d: string, line: string) => {
        if (cd.dns(d)) j(line)
    }

    /*
    * @bnan@
    * [en]
    * [ru] Переход на op2, если op1 = nan
    */
    const bnan = (v: string, line: string) => __bOp(cd.nan, line, v)

    /*
    * @breq@
    * [en] Relative jump to +op3 if op1 = op2
    * [ru] Относительный переход на +op3, если op1 = op2
    */
    const breq = (a: string, b: string, offset: string) => __bROp(cd.eq, offset, a, b)

    /*
    * @breqz@
    * [en] Relative jump to +op2 if op1 = 0
    * [ru] Относительный переход на +op2, если op1 = 0
    */
    const breqz = (a: string, offset: string) => __bROp(cd.eq, offset, a)

    /*
    * @brge@
    * [en] Relative jump to +op3 if op1 >= op2
    * [ru] Относительный переход на +op3, если op1 >= op2
    */
    const brge = (a: string, b: string, offset: string) => __bROp(cd.ge, offset, a)

    /*
    * @brgez@
    * [en] Relative jump to +op2 if op1 >= 0
    * [ru] Относительный переход на +op2, если op1 >= 0
    */
    const brgez = (a: string, offset: string) => __bROp(cd.ge, offset, a)

    /*
    * @brgt@
    * [en] Relative jump to +op3 if op1 > op2
    * [ru] Относительный переход на +op3, если op1 > op2
    */
    const brgt = (a: string, b: string, offset: string) => __bROp(cd.gt, offset, a, b)

    /*
    * @brgtz@
    * [en] Relative jump to +op2 if op1 > 0
    * [ru] Относительный переход на +op2, если op1 > 0
    */
    const brgtz = (a: string, offset: string) => __bROp(cd.gt, offset, a)

    /*
    * @brle@
    * [en] Relative jump to +op3 if op1 <= op2
    * [ru] Относительный переход на +op3, если op1 <= op2
    */
    const brle = (a: string, b: string, offset: string) => __bROp(cd.le, offset, a, b)

    /*
    * @brlez@
    * [en] Relative jump to +op2 if op1 <= 0
    * [ru] Относительный переход на +op2, если op1 <= 0
    */
    const brlez = (a: string, offset: string) => __bROp(cd.le, offset, a)

    /*
    * @brlt@
    * [en] Relative jump to +op3 if op1 < op2
    * [ru] Относительный переход на +op3, если op1 < op2
    */
    const brlt = (a: string, b: string, offset: string) => __bROp(cd.lt, offset, a, b)

    /*
    * @brltz@
    * [en] Relative jump to +op2 if op1 < 0
    * [ru] Относительный переход на +op2, если op1 < 0
    */
    const brltz = (a: string, offset: string) => __bROp(cd.lt, offset, a)

    /*
    * @brne@
    * [en] Relative jump to +op3 if op1 != op2
    * [ru] Относительный переход на +op3, если op1 != op2
    */
    const brne = (a: string, b: string, offset: string) => __bROp(cd.ne, offset, a, b)

    /*
    * @brnez@
    * [en] Relative jump to +op2 if op1 != 0
    * [ru] Относительный переход на +op2, если op1 != 0
    */
    const brnez = (a: string, offset: string) => __bROp(cd.ne, offset, a)

    /*
    * @brap@
    * [en] Relative jump to +op4 if op1 op2 with precision op3
    * [ru] Относительный переход на +op4, если op1 op2 с точностью op3
    */
    const brap = (x: string, y: string, c: string, offset: string) => __bROp(cd.ap, offset, x, y, c)

    /*
    * @brapz@
    * [en] Relative jump to +op3 if op1 0 with precision op2
    * [ru] Относительный переход на +op3, если op1 0 с точностью op2
    */
    const brapz = (x: string, y: string, offset: string) => __bROp(cd.ap, offset, x, y)

    /*
    * @brna@
    * [en] Relative jump to +op4 if op1 op2 with precision op3
    * [ru] Относительный переход на +op4, если op1 op2 с точностью op3
    */
    const brna = (x: string, y: string, c: string, offset: string) => __bROp(cd.na, offset, x, y, c)

    /*
    * @brnaz@
    * [en] Relative jump to +op3 if op1 0 with precision op2
    * [ru] Относительный переход на +op3, если op1 0 с точностью op2
    */
    const brnaz = (x: string, y: string, offset: string) => __bROp(cd.ap, offset, x, y)

    /*
    * @brdse@
    * [en] Relative jump to +op2 if channel op1 is configured
    * [ru] Относительный переход на +op2, если канал op1 настроен
    */
    const brdse = (d: string, offset: string) => {
        if (cd.dse(d)) jr(offset)
    }

    /*
    * @brdns@
    * [en] Relative jump to +op2 if channel op1 is not configured
    * [ru] Относительный переход на +op2, если канал op1 не настроен
    */
    const brdns = (d: string, offset: string) => {
        if (cd.dns(d)) jr(offset)
    }

    /*
    * @brnan@
    * [en]
    * [ru] Относительный переход на +op2, если op1 = nan
    */
    const brnan = (v: string, offset: string) => __bROp(cd.nan, offset, v)

    /*
    * @beqal@
    * [en] Jump to op3 if op1 = op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 = op2 с записью адреса следующей строки в ra
    */
    const beqal = (a: string, b: string, line: string) => __bCOp(cd.eq, line, a, b)

    /*
    * @beqzal@
    * [en] Jump to op2 if op1 = 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 = 0 с записью адреса следующей строки в ra
    */
    const beqzal = (a: string, line: string) => __bCOp(cd.eq, line, a)

    /*
    * @bgeal@
    * [en] Jump to op3 if op1 >= op2, writing next line address to ra
    * [ru] Переход на op3, если op1 >= op2 с записью адреса следующей строки в ra
    */
    const bgeal = (a: string, b: string, line: string) => __bCOp(cd.ge, line, a, b)

    /*
    * @bgezal@
    * [en] Jump to op2 if op1 >= 0, writing next line address to ra
    * [ru] Переход на op2, если op1 >= 0 с записью адреса следующей строки в ra
    */
    const bgezal = (a: string, line: string) => __bCOp(cd.ge, line, a)

    /*
    * @bgtal@
    * [en] Jump to op3 if op1 > op2, writing next line address to ra
    * [ru] Переход на op3, если op1 > op2 с записью адреса следующей строки в ra
    */
    const bgtal = (a: string, b: string, line: string) => __bCOp(cd.gt, line, a, b)

    /*
    * @bgtzal@
    * [en] Jump to op2 if op1 > 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 > 0 с записью адреса следующей строки в ra
    */
    const bgtzal = (a: string, line: string) => __bCOp(cd.gt, line, a)

    /*
    * @bleal@
    * [en] Jump to op3 if op1 <= op2, writing next line address to ra
    * [ru] Переход на op3, если op1 <= op2 с записью адреса следующей строки в ra
    */
    const bleal = (a: string, b: string, line: string) => __bCOp(cd.le, line, a, b)

    /*
    * @blezal@
    * [en] Jump to op2 if op1 <= 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 <= 0 с записью адреса следующей строки в ra
    */
    const blezal = (a: string, line: string) => __bCOp(cd.le, line, a)

    /*
    * @bltal@
    * [en] Jump to op3 if op1 < op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 < op2 с записью адреса следующей строки в ra
    */
    const bltal = (a: string, b: string, line: string) => __bCOp(cd.lt, line, a, b)

    /*
    * @bltzal@
    * [en] Jump to op2 if op1 < 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 < 0 с записью адреса следующей строки в ra
    */
    const bltzal = (a: string, line: string) => __bCOp(cd.lt, line, a)

    /*
    * @bneal@
    * [en] Jump to op3 if op1 != op2, writing next line address to ra
    * [ru] Переход на op3, если op1 != op2 с записью адреса следующей строки в ra
    */
    const bneal = (a: string, b: string, line: string) => __bCOp(cd.ne, line, a, b)

    /*
    * @bnezal@
    * [en] Jump to op2 if op1 != 0, writing the address of the next line to ra
    * [ru] Переход на op2, если op1 != 0 с записью адреса следующей строки в ra
    */
    const bnezal = (a: string, line: string) => __bCOp(cd.ne, line, a)

    /*
    * @bapal@
    * [en] Jump to op4 if op1 op2 with precision op3, writing the address of the next line to ra
    * [ru] Переход на op4, если op1 op2 с точностью op3 с записью адреса следующей строки в ra
    */
    const bapal = (x: string, y: string, c: string, line: string) => __bCOp(cd.ap, line, x, y, c)

    /*
    * @bapzal@
    * [en] Jump to op3 if op1 0 with precision op2, writing the address of the next line to ra
    * [ru] Переход на op3, если op1 0 с точностью op2 с записью адреса следующей строки в ra
    */
    const bapzal = (x: string, y: string, line: string) => __bCOp(cd.ap, line, x, y)

    /*
    * @bnaal@
    * [en] Jump to op4 if op1 ~= op2 with precision op3, writing next line address to ra
    * [ru] Переход на op4, если op1 ~= op2 с точностью op3 с записью адреса следующей строки в ra
    */
    const bnaal = (x: string, y: string, c: string, line: string) => __bCOp(cd.na, line, x, y, c)

    /*
    * @bnazal@
    * [en] Jump to op3 if op1 ~= 0 with precision op2, writing next line address to ra
    * [ru] Переход на op3, если op1 ~= 0 с точностью op2 с записью адреса следующей строки в ra
    */
    const bnazal = (x: string, y: string, line: string) => __bCOp(cd.na, line, x, y)

    /*
    * @bdseal@
    * [en] Jump to op2 if channel op1 is configured with next line address written to ra
    * [ru] Переход на op2, если канал op1 настроен с записью адреса следующей строки в ra
    */
    const bdseal = (d: string, line: string) => {
        if (cd.dse(d)) jal(line)
    }

    /*
    * @bdnsal@
    * [en] Jump to op2 if channel op1 is not configured, writing next line address to ra
    * [ru] Переход на op2, если канал op1 не настроен с записью адреса следующей строки в ra
    */
    const bdnsal = (d: string, line: string) => {
        if (cd.dns(d)) jal(line)
    }

    return {
        j, jr, jal,
        beq, beqz, bge, bgez, bgt, bgtz, ble, blez, blt, bltz, bne, bnez, bap, bapz, bna, bnaz, bdse, bdns, bnan,
        breq, breqz, brge, brgez, brgt, brgtz, brle, brlez, brlt, brltz, brne, brnez, brap, brapz, brna, brnaz, brdse, brdns, brnan,
        beqal, beqzal, bgeal, bgezal, bgtal, bgtzal, bleal, blezal, bltal, bltzal, bneal, bnezal, bapal, bapzal, bnaal, bnazal, bdseal, bdnsal
    }
}