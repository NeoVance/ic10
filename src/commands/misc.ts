import {CommandBuilder} from "./core";

export const makeMiscCommands: CommandBuilder = scope => {

    /*
    * @yield@
    * [en] Pausing the program until the next tick
    * [ru] Приостановка программы до следующего тика
    */
    const _yield = () => {}

    /*
    * @sleep@
    * [en] Pause the program for op1 seconds
    * [ru] Приостановка программы на op1 секунд
    */
    const sleep = (s: string) => scope.sleeping = Math.ceil(scope.memory.getValue(s) / scope.settings.tickTime)

    /*
    * @hcf@
    * [en] Stop work and burn the microprocessor
    * [ru] Остановить работу и сжечь микропроцессор
    */
    const hcf = () => console.log("Die mother fucker, die!!!!!")

    return { yield: _yield, sleep, hcf }
}