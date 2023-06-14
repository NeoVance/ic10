import {m, run} from "./utils";
import {DebugDevice} from "../src/devices/Device";

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

    test('issues 61', () => {
        run({ connectedDevices: {
                d0: new DebugDevice(0, { PrefabHash: 5465465,  On: 100 }),
            } })`
            move r1 15
            move r15 5465465
            lb r0 rr1 On Minimum
        `

        expect(m.reg('r0').value).toBe(100)
    })

    test('Lb', () => {
        run({ connectedDevices: {
                d0: new DebugDevice(0, { PrefabHash: -2138748650,  Horizontal: 100 }),
            } })`
            define dhDish -2138748650
            lb r2 dhDish Horizontal Sum
        `
        expect(m.reg('r2').value).toBe(100)
    })

    test('write to device with alias', () => {
        run({ connectedDevices: {
                d0: new DebugDevice(0, { PrefabHash: 5465465,  On: 100 }),
            } })`
            alias device d0
            alias val r1
            move val 100
            s device Setting val
        `

        expect(m.dev("device").get('Setting')).toBe(100)
    })
})