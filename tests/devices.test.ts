import {m, run} from "./utils";
import {DebugDevice} from "../src/Device";

describe('devices', () => {
    test('write into device', () => {
        run({ connectedDevices: {
                d0: new DebugDevice(0, { Setting: 0 })
            } })`
            s d0 Setting 8
        `

        expect(m.dev("d0").get('Setting')).toBe(8)
    })

    test('read from device', () => {
        run({ connectedDevices: {
                d0: new DebugDevice(0, { Setting: 0 })
            } })`
            s d0 Setting 15
            l r1 d0 Setting
        `

        expect(m.reg('r1').value).toBe(15)
    })

    test('dr_n', () => {
        run({ connectedDevices: {
                d1: new DebugDevice(0, { Setting: 0 })
            } })`
            move r0 1
            s dr0 Setting 5
        `

        expect(m.dev("d1").get("Setting")).toBe(5)
    })
})