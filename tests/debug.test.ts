import {interpreterIc10, makeDebugger, run} from "./utils";
import {DebugDevice, IcHash} from "../src/devices/Device";

describe("debugging", () => {
    const { debugCallback, debugInfo } = makeDebugger()

    test('debug callback and dn', () => {
        const d0 = new DebugDevice(0, {
            Setting: 0,
            PrefabHash: 1
        })

        run({
            connectedDevices: { d0 },
            ic10Conf: { debug: true, debugCallback }
        })`
            move r0 1
            #d0 2
            #d0 Setting 5
        `
        expect(d0.get("PrefabHash")).toBe(2)
        expect(d0.get("Setting")).toBe(5)
        expect(debugInfo).toStrictEqual([
            { cmd: "move", args: ['r0', '1'] },
            { cmd: "_d0", args: ['2'] },
            { cmd: "_d0", args: ['Setting', '5'] }
        ])
    })

    test('log', () => {
        const { debugCallback, debugInfo } = makeDebugger()

        const d0 = new DebugDevice(1, {
            Setting: 0,
            PrefabHash: 1
        })

        d0.getSlot(0).init({
            OccupantHash: IcHash
        })

        run({
            connectedDevices: { d0 },
            ic10Conf: {
                logCallback: debugCallback
            }
        })`
            #log 2
            #log d0
            #log d0.Setting
            #log d0.slot.0
            #log d0.slot.0.OccupantHash
            #log d0.Setting 2 r0
        `

        expect(debugInfo).toStrictEqual([
            { cmd: 'Log[2]: ', args: ['2 = 2;'] },
            { cmd: 'Log[3]: ', args: ['d0 = {"PrefabHash":1,"Setting":0};'] },
            { cmd: 'Log[4]: ', args: ['d0.Setting = 0;'] },
            { cmd: 'Log[5]: ', args: [`d0.slot.0 = ${JSON.stringify(d0.getSlot(0))};`] },
            { cmd: 'Log[6]: ', args: [`d0.slot.0.OccupantHash = ${IcHash};`] },
            { cmd: 'Log[7]: ', args: ['d0.Setting = 0;', `2 = 2;`, `r0 = 0;`] }
        ])
    })

    test("reverse alias", () => {
        run`
            alias test r0
        `

        const t = interpreterIc10.memory.aliasesRevert["r0"]

        expect(t).toBe("test")
    })
})