import {CommandBuilder} from "./core";

export const makeStackCommands: CommandBuilder = scope => {

    /*
    * @push@
    * [en] Push op1 onto the stack
    * [ru] Положить op1 на стек
    */
    const push = (a: string) => {
        scope.memory.stack.push(scope.memory.getValue(a))
    }

    /*
    * @pop@
    * [en] Pop a value from the stack and write to op1
    * [ru] Снять значение со стека и записать в op1
    */
    const pop = (register: string) => {
        scope.memory.getRegister(register).value = scope.memory.stack.pop()
    }

    /*
    * @peek@
    * [en] Push the top value off the stack into op1 without moving the stack
    * [ru] Записать в op1 верхнее значение со стека не двигая стек
    */
    const peek = (register: string) => {
        scope.memory.getRegister(register).value = scope.memory.stack.peek()
    }

    return { push, pop, peek }
}