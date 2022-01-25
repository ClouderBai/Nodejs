/* global __dirname */
const _ = require('lodash')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')
const { loadFile } = require('./common/load_file')
const { fetchHco } = require('./api/veeva')
const fsx = require('fs-extra')


/**
 * fetch veeva hco data
 */
module.exports = async function () {

    const vnEntityIds = fs.readFileSync('./static/hco/vn_entity_id.txt')
        .toString()
        .replace(/\r|\n/g, '')
        .split(',')
    console.log('----------vnEntityIds-------------', vnEntityIds.length)
    // list already exist in hco directory
    const fileNameExist = fsx.readdirSync('./static/hco/source')
    // filter vnEntityId
    const vnEntityIdsFiltered = _.filter(vnEntityIds, (vnEntityId) => !fileNameExist.includes(vnEntityId))
    // const vnEntityIdsFiltered = vnEntityIds
    // split into chunk
    const chunks = _.chunk(vnEntityIdsFiltered, 10)

    for (const it of chunks) {
        // promise
        const promiseArr = it.reduce((promises, entityId) => {
            const item = fetchHco(entityId)
            promises.push(item)
            return promises
        }, [])
        // fetch data
        const response = await Promise.all(promiseArr)
        // write to local
        for (const res of response) {
            if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length > 0) {
                const entities = res.entities
                fsx.writeJsonSync(`./static/hco/source/${res.entities[0].entityId}`, entities)
            } else if (res.responseStatus == 'FAILURE' && res.errors && res.errors.length > 0 && res.errors[0].message.includes('No entity found with the given Id Network:Entity:')) {
                const errorEntityId = res.errors[0].message.replace('No entity found with the given Id Network:Entity:', '')
                fsx.writeJsonSync(`./static/hco/hco_error/${errorEntityId}.json`, res.errors)
            } else {
                throw new Error(`${it.toString()} Get Error: response error`)
            }
        }
        console.log(`finish item ${it.toString()}`)
    }
}



/**
 * address
 */
// module.exports = async function () {
//     const cntyCodeMap = {}
//     const cityCodeMap = {}
//     const cntySourceData = loadFile('./m_cnty.csv')
//     const citySourceData = loadFile('./m_city.csv')
//     cntySourceData.forEach(v => { cntyCodeMap[v.cnty_name] = v.cnty_cd })
//     citySourceData.forEach(v => { cityCodeMap[v.city_name] = v.city_cd })

//     const fileName = fsx.readdirSync('./hco')
//     console.log(fileName)
//     for (const filename of fileName) {
//         const entityInfo = fsx.readJsonSync(`./hco/${filename}`)
//         const entityObject = entityInfo[0]

//         const field = {}
//         let address = entityObject.entity.addresses__v.find(v => v.address_status__v == 'A')
//         if (!address && entityObject.entity.addresses__v.every(v => v.address_status__v == 'I')) {
//             console.log('----------entityObject inActive-------------', entityObject.entityId)
//             address = entityObject.entity.addresses__v.find(v => v.address_line_1__v)
//         }
//         if (!address) throw new Error(`${filename} No address found`)
//         Object.assign(field, {
//             cnty_name: address.sub_administrative_area__v,
//             adrs_line_1: address.address_line_1__v,
//             city_name: address.locality__v,
//             frmt_adrs: address.formatted_address__v,
//             cnty_cd: cntyCodeMap[address.sub_administrative_area__v] || null,
//             city_cd: cityCodeMap[address.locality__v] || null,
//             pstl: address.postal_code__v,
//             adrs_status: address.address_status__v,
//             prvnc_cd: address.administrative_area__v,

//         })
//         fsx.writeJsonSync(`./hco_field/${address.entity_vid__v}`, field)
//     }
// }


/** 
 * ref_hcp_hco
 */
module.exports = async function () {
    const fileName = fsx.readdirSync('./static/hco/source')
    console.log(fileName)
    for (const filename of fileName) {
        const entityInfo = fsx.readJsonSync(`./static/hco/source/${filename}`)
        if(entityInfo.length > 1) throw new Error(`entityInfo.length > 1=${entityInfo[0].entityId}`)
        const [hcp] = entityInfo
        const { entity } = hcp 
        entity.master_vid__v


        const field = {}
        
        Object.assign(field, {
            ref_hcp_hco_id: entity.Error,
            is_prmry: entity.is_primary_relationship__v === 'Y' ? 1 : 0,
            afltn_role_cd: entity.Error,
            afltn_role_name: entity.Error,
            hcp_id: entity.Error,
            hco_id: entity.Error,
            prnt_hco_stts: entity.Error,
            rcrd_state_cd: entity.Error,
            is_veeva_master: entity.Error,

        })
        fsx.writeJsonSync(`./hco_field/${entity.entity_vid__v}`, field)
    }
}




// module.exports = async function () {
//     const fileName = fsx.readdirSync('./hco_field')
//     console.log(fileName)
//     for (const filename of fileName) {
//         const info = fsx.readJsonSync(`./hco_field/${filename}`)

//         let sql = `UPDATE cmd_owner.m_hco SET `
//         const sql_end = ` WHERE vn_entity_id='${filename}';\r\n`

//         const keys = Object.keys(info)
//         const lastIndex = keys.length - 1
//         keys.forEach((key, index) => {
//             if (info[key]) {
//                 sql += (info[key] ? `${key}='${info[key]}'` : '')
//                 if (lastIndex !== index) sql += ', '
//             }
//         })

//         sql = sql + sql_end + '\r\n';

//         fsx.appendFileSync(`./hco_sql/hco_262.sql`, sql)
//     }
// }


