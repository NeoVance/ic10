import {m, run} from "./utils";
import {DebugDevice} from "../src/devices/Device";

describe('devices', () => {
    test('write into device', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {Setting: 0})
            }
        })`
            s d0 Setting 8
        `

        expect(m.dev("d0").get('Setting')).toBe(8)
    })

    test('read from device', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {Setting: 0})
            }
        })`
            s d0 Setting 15
            l r1 d0 Setting
        `

        expect(m.reg('r1').value).toBe(15)
    })

    test('dr_n', () => {
        run({
            connectedDevices: {
                d1: new DebugDevice(0, {Setting: 0})
            }
        })`
            move r0 1
            s dr0 Setting 5
        `

        expect(m.dev("d1").get("Setting")).toBe(5)
    })

    test('Lb', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {PrefabHash: -2138748650, Horizontal: 100}),
            }
        })`
            define dhDish -2138748650
            lb r2 dhDish Horizontal Sum
        `
        expect(m.reg('r2').value).toBe(100)
    })

    test('write to device with alias', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {PrefabHash: 5465465, On: 100}),
            }
        })`
            alias device d0
            alias val r1
            move val 100
            s device Setting val
        `

        expect(m.dev("device").get('Setting')).toBe(100)
    })

    test('read reagents', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {PrefabHash: 0}, {
                    reagents: {
                        Contents: {Copper: 1},
                        Required: {Iron: 2},
                        Recipe: {Electrum: 3}
                    }
                })
            }
        })`
            lr r0 d0 0 HASH("Copper")
            lr r1 d0 1 HASH("Iron")
            lr r2 d0 2 HASH("Electrum")
        `

        expect(m.reg("r0").value).toBe(1)
        expect(m.reg("r1").value).toBe(2)
        expect(m.reg("r2").value).toBe(3)
    })

    test('issues #61', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {PrefabHash: 336213101,On:0})
            }
        })`
alias autolathe r5
alias electronics r6
alias hydraulic r7
alias tool r8
alias security r9

move autolathe 336213101
move electronics 1307165496
move hydraulic -1888248335
move tool -465741100
move security -641491515

reset:
yield
move r14 0

check:
bdns dr14 next

add r15 r14 5
lb r0 rr15 On Minimum
s dr14 On r0

next:
beq r14 4 reset
add r14 r14 1
j check
        `

        expect(m.reg("r0").value).toBe(0)
    })

    test('write into device chanel', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {Setting: 0})
            }
        })`
            s d0:0 Channel0 8
        `

        expect(m.dev("d0").getChannel(0).get('Channel0')).toBe(8)
    })

    test('read from device chanel', () => {
        run({
            connectedDevices: {
                d0: new DebugDevice(0, {Setting: 0})
            }
        })`
            s d0:0 Channel0 8
            l r1 d0:0 Channel0
        `

        expect(m.dev("d0").getChannel(0).get('Channel0')).toBe(8)
        expect(m.reg('r1').value).toBe(8)
    })
})
