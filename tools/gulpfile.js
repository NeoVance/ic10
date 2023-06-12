"use strict"
const gulp = require("gulp")
const getData = require(__dirname + "/ajax.js")
const fs = require("fs");
const axios = require("axios");
gulp.task("generate-types", async function () {
    const IC10Data = await getData()
    const types = {
        'SlotParameter': [],
        'DeviceParameter': [],
        'Function': [],
        'Const': [],
        'Channel': [],
        'BM': [],
        'RM': [],
    };

    for (const languageKey in IC10Data.Languages["en"]) {
        const data = IC10Data.Languages["en"][languageKey]
        const p = (data) => {
            switch (data['type']) {
                case 'Slot parameter':
                    types['SlotParameter'].push(languageKey)
                    break;
                case 'Device parameter':
                    types['DeviceParameter'].push(languageKey)
                    break;
                case 'Function':
                    types['Function'].push(languageKey)
                    break;
                case 'Const':
                    types['Const'].push(languageKey)
                    break;
                case 'Channel':
                    types['Channel'].push(languageKey)
                    break;
                case 'BM':
                    types['BM'].push(languageKey)
                    break;
                case 'RM':
                    types['RM'].push(languageKey)
                    break;
            }
        }
        if (Array.isArray(data)) {
            p(data[0])
            p(data[1])
        } else {
            p(data)
        }
    }

    types['SlotParameter'] = types['SlotParameter'].sort()
    types['DeviceParameter'] = types['DeviceParameter'].sort()
    types['Function'] = types['Function'].sort()
    types['Const'] = types['Const'].sort()
    types['Channel'] = types['Channel'].sort()
    types['BM'] = types['BM'].sort()
    types['RM'] = types['RM'].sort()
    const escape = (val) => {
        return `'${val}'`
    }

    const SlotParameter = types['SlotParameter'].map(escape)
    const DeviceParameter = types['DeviceParameter'].map(escape)
    const Function = types['Function'].map(escape)
    const Const = types['Const'].map(escape)
    const Channel = types['Channel'].map(escape)
    const BM = types['BM'].map(escape)
    const RM = types['RM'].map(escape)

    const makeDef = (name, values) => ([
        `const values${name} = [ ${values.join(", ")} ] as const`,
        `export type Type${name} = (typeof values${name})[number]`,
        `export const is${name} = (val: string): val is Type${name} => values${name}.includes(val as Type${name})`
    ])

    const lines = [
        ...makeDef("SlotParameter", SlotParameter),
        ...makeDef("DeviceParameter", DeviceParameter),
        ...makeDef("Function", Function),
        ...makeDef("Const", Const),
        ...makeDef("Channel", Channel),
        ...makeDef("BM", BM),
        ...makeDef("RM", RM),
        'export const isKeyword = (s: string) => isChannel(s) || isSlotParameter(s) || isDeviceParameter(s) || isConst(s)'
    ];


    fs.writeFileSync("../src/icTypes.ts", lines.join("\n"))
})

gulp.task("generate-devices", async function () {
    const devices = await axios("https://icx.traineratwot.site/GetDevice")
    const b = JSON.stringify(devices.data.object, null, 2)
    const text = "import {DeviceDataType} from \"../types\";\n" +
        "\n" +
        `export const devices:DeviceDataType = \n ${b} as const;\n\nexport default devices;`

    fs.writeFileSync("../src/data/devices.ts", text)
})


gulp.task("generate-jsDoc", async function () {
    //TODO: refactor
    process.exit(1);
    const IC10Data = await getData()
    let mainTs = fs.readFileSync("../src/main.ts").toString()
    for (const languageKey in IC10Data.Languages["en"]) {
        const dataRu = IC10Data.Languages["ru"][languageKey]
        const dataEn = IC10Data.Languages["en"][languageKey]
        switch (dataEn['type']) {
            case 'Function':
                mainTs = mainTs.replace(`    * @${languageKey}@`,
                    `    * @${languageKey}@\n` +
                    `    * [en] ${dataEn.description.text.replace('\n', ' ').trim()}\n` +
                    `    * [ru] ${dataRu.description.text.replace('\n', ' ').trim()}`
                )
                break;
            default :
                break;
        }
    }
    fs.writeFileSync("../src/main.ts", mainTs)
})


