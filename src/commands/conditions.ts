import {Scope} from "./core";

export const makeConditions = (scope: Scope) => {
    const eq = (a: number, b: number = 0) => a == b

    const ge = (a: number, b: number = 0) => a >= b

    const gt = (a: number, b: number = 0) => a > b

    const le = (a: number, b: number = 0) => a <= b

    const lt = (a: number, b: number = 0) => a < b

    const ne = (a: number, b: number = 0) => a != b

    const ap = (x: number, y: number, c: number = 0) => !na(x, y, c)

    const na = (x: number, y: number, c: number = 0) => Math.abs(x - y) > c * Math.max(Math.abs(x), Math.abs(y))

    const dse = (d: string) => scope.memory.findDevice(d) !== undefined

    const dns = (d: string) => !dse(d)

    const nan = (v: number) => isNaN(scope.memory.getValue(v))

    const nanz = (v: number) => !nan(v)

    return { eq, ge, gt, le, lt, ne, ap, na, dse, dns, nan, nanz }
}

export type Conditions = ReturnType<typeof makeConditions>