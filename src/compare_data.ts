import { plainToClass } from 'class-transformer'
import fsx from 'fs-extra'
import fs from 'fs'
import _ from 'lodash'
import { loadFile } from '../common'
import moment from 'moment'

const transform = async() => {
    const file1 = loadFile('C:/Users/ConnorBai/Downloads/202112ORG.xlsx')

    const dataMap1 = file1.reduce((total, next) => {
        // if(['6W'].includes(next.RGN_CD)) next.RSD_GLOBAL_ID = ''
        const str = `${next.BU_CD}_${next.BU_HEAD_GLOBAL_ID}_${next.NATIONAL_CD}_${next.NSD_GLOBAL_ID}_${next.RGN_CD}_${next.RSD_GLOBAL_ID}_${next.DSTRCT_CD}_${next.DSM_ID}_${next.DSTRCT_CD}_${next.DM_GLOBAL_ID}_${next.REP_ID}_${next.TRTRY_CD}_${next.REP_GLOBAL_ID}`
        const str1 = str.replace(/\s/g, '').replace(/undefined/g, '').replace(/-/g, '')
        total.set(str1, true)
        return total
    }, new Map<string, boolean>())

    const file2 = loadFile('C:/Users/ConnorBai/Downloads/view_sales_org2.csv')

    const dataMap2 = file2.reduce((total, next) => {
        const str = `${next.bu_cd}_${next.buhead_glgl_emply_id}_${next.area_cd}_${next.nsd_glgl_emply_id}_${next.rgn_cd}_${next.rsd_glgl_emply_id}_${next.dstrct_cd}_${next.dstrct_star_id}_${next.dstrct_cd}_${next.dsm_glgl_emply_id}_${next.trtry_star_id}_${next.trtry_cd}_${next.rep_glgl_emply_id}`
        const str1 = str.replace(/\s/g, '').replace(/undefined/g, '').replace(/-/g, '')
        total.set(str1, true)
        return total
    }, new Map<string, boolean>())
    // for (const [key, value] of dataMap2) {
    //     if(dataMap1.has(key)) {
    //         const a = dataMap1.has(key)
    //         dataMap1.delete(key)
    //         dataMap2.delete(key)
    //     } else {
    //         console.log('----------it-------------', key)
    //     }
    // }
    const keys1 = Object.keys(dataMap1)
    const keys2 = Object.keys(dataMap2)

    for (const key of keys2) {
        if(keys1.includes(key)) {
            key
        } else {
            console.log('----------key 2-------------', key)
        }
    }
    dataMap2
}


export const main = async () => {
    // await transform()
    const currentCycle = moment().format('YYYY-MM-DD hh:mm:ss')

    console.log(_.uniqueId('contact_'))
 
    
    console.log(_.uniqueId())


      1
}