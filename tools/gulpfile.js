"use strict"
const gulp = require("gulp")
const getData = require(__dirname + "/ajax.js")
const fs = require("fs");
const {exec} = require("child_process");

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

    const lines = [];

    for (const languageKey in IC10Data.Languages["en"]) {
        const data = IC10Data.Languages["en"][languageKey]
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

    lines.push(`export type TypeSlotParameter = ${SlotParameter.join("|")}`)
    lines.push(`export function isSlotParameter(val: string): val is TypeSlotParameter {return [${SlotParameter.join(",")}].includes(val)}`)

    lines.push(`export type TypeDeviceParameter = ${DeviceParameter.join("|")}`)
    lines.push(`export function isDeviceParameter(val: string): val is TypeDeviceParameter {return [${DeviceParameter.join(",")}].includes(val)}`)

    lines.push(`export type TypeFunction = ${Function.join("|")}`)
    lines.push(`export function isFunction(val: string): val is TypeFunction {return [${Function.join(",")}].includes(val)}`)

    lines.push(`export type TypeConst = ${Const.join("|")}`)
    lines.push(`export function isConst(val: string): val is TypeConst {return [${Const.join(",")}].includes(val)}`)

    lines.push(`export type TypeChannel = ${Channel.join("|")}`)
    lines.push(`export function isChannel(val: string): val is TypeChannel {return [${Channel.join(",")}].includes(val)}`)

    lines.push(`export type TypeBM = ${BM.join("|")}`)
    lines.push(`export function isBM(val: string): val is TypeBM {return [${BM.join(",")}].includes(val)}`)

    lines.push(`export type TypeRM = ${RM.join("|")}`)
    lines.push(`export function isRM(val: string): val is TypeRM {return [${RM.join(",")}].includes(val)}`)


    fs.writeFileSync("../src/icTypes.ts", lines.join("\n"))
    // exec("cd .. && tsc")
})


gulp.task("generate-jsDoc", async function () {
    process.exit(1);
    const IC10Data = await getData()
    let mainTs = fs.readFileSync("../src/main.ts").toString()
    const lines = [];
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


