import {interpreterIc10, m, run} from "./utils";

describe("registers", () => {
    test('move values', () => {
        run`
            move r0 1
            alias reg r5
            move reg r0
            move r1 reg
        `

        const [
            r0, r1, r2, r5, reg
        ] = ["r0", "r1", "r2", "r5", "reg"].map(m.reg)

        expect(r0.value).toBe(1)
        expect(r1.value).toBe(1)
        expect(r2.value).toBe(0)
        expect(r5.value).toBe(1)
        expect(r5).toBe(reg)
    })

    test('incorrect register', () => {
        expect(() => {
            run`move test 5`
        }).toThrow('Not a register: test')
    })

    test('stack', () => {
        run`
            move r0 1
            move r1 2
            push r0
            push r1
            push 7
            push 32
            push r17
        `

        const stack = m.stack()

        const expectedValues = [1, 2, 7, 32, 0]

        expectedValues.forEach((v, i) => expect(stack[i]).toBe(v))
    })

    test('nested register', () => {
        run`
            move r0 2
            move r2 4
            move rr0 10
        `

        expect(interpreterIc10.memory.getRegister('r2').value).toBe(10)
    })
})