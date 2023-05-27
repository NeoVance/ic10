import InterpreterIc10 from "../src/main";

const interpreterIc10 = new InterpreterIc10();

interpreterIc10.setSettings({
    executionCallback: (err) => {
        throw err
    }
})

const joinTemplate = (strings: TemplateStringsArray, values: any[]) =>
    strings
        .map((s, i) => `${s}${values[i] ?? ""}`)
        .join("")

function ic10(strings: TemplateStringsArray, ...values: any[]) {
    return joinTemplate(strings, values)
        .split('\n')
        .map(line => line.trimStart())
        .join("\n")
}

function interpret(strings: TemplateStringsArray, ...values: any[]) {
    return interpreterIc10.init(joinTemplate(strings, values))
}

const runWithoutLoop = () => {
    for (let i = 0; i < interpreterIc10.commands.length; i++)
        interpreterIc10.prepareLine()
}

describe('test', () => {

	test('alias and move', () => {
		interpret`
            alias heading r2
            move heading 10
        `

        runWithoutLoop()

		expect(interpreterIc10.memory.getRegister('heading').value).toBe(10)
        expect(interpreterIc10.memory.getRegister('r2').value).toBe(10)
	});

	test('example code', () => {
		const code = ic10`
            alias velocityRelativeX r0
            alias velocityRelativeZ r1
            alias heading r2
            alias Suit db
            l velocityRelativeX Suit VelocityRelativeX
            l velocityRelativeZ Suit VelocityRelativeZ
            move heading 0
            atan2 heading velocityRelativeX velocityRelativeZ
            div heading heading 3.14
            mul heading heading 180
        `
		interpreterIc10.init(code)

        runWithoutLoop()
	});

	test('stack', () => {
		const code = ic10`
            move r0 1
            move r1 2
            push r0
            push r1
            push 7
            push 32
            push r17
        `
		interpreterIc10.init(code)

        runWithoutLoop()

        const stack = interpreterIc10.memory.stack.getStack()

        const expectedValues = [1, 2, 7, 32, 0]

        expectedValues.forEach((v, i) => expect(stack[i]).toBe(v))
	});

	test('rr_n', () => {
		const code = ic10`
            move r0 2
            move r2 4
            move rr0 10
        `
		interpreterIc10.init(code)
        runWithoutLoop()

		expect(interpreterIc10.memory.getRegister('r2').value).toBe(10)
	});

    test('dr_n', () => {
        const code = ic10`
            move r0 1
            s dr0 Setting 5
        `

        interpreterIc10.init(code)
        runWithoutLoop()

        expect(interpreterIc10.memory.getDevice('d1').get('Setting')).toBe(5)
    })

	test('write into device', () => {
		const code = ic10`
            s d0 Setting 8
        `
		interpreterIc10.init(code)
		runWithoutLoop()

		expect(interpreterIc10.memory.getDevice('d0').get('Setting')).toBe(8)
	});

	test('read from device', () => {
		const code = ic10`
            s d0 Setting 15
            l r1 d0 Setting
        `
		interpreterIc10.init(code)
		runWithoutLoop()

		expect(interpreterIc10.memory.getRegister('r1').value).toBe(15)
	});

	test('float', () => {
		const code = ic10`
            move r0 0
            move r1 0
            move r2 0.1
            l r3 d0 Activate
        `
		interpreterIc10.init(code)
		runWithoutLoop()
	});

	test('example2',  () => {
		const code = ic10`
                move r0 5
                slt r15 r0 5
                beqz r15 if0exit
                s d0 Setting 0
            if0exit:
                move r15 80
                move r14 15
                jal update
                move r13 r0
                move r12 0
                jal update2
                jr 13
            update:
                alias b r15
                alias a r14
                s d0 Setting b
                s d0 Vertical a
                j ra
            update2:
                alias b r13
                alias c r12
                s d0 Setting b
                s d0 Vertical a
                j ra
        `
		interpreterIc10.init(code)
        interpreterIc10.runUntil(s => s !== true, 100)

        expect(interpreterIc10.memory.environ.d0.properties.Setting).toBe(5)
	});
});