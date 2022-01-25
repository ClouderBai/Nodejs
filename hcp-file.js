/* global __dirname */
const _ = require('lodash')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')
const { fetchHcpFile } = require('./api/veeva')
const fsx = require('fs-extra')


/**
 * fetch veeva hco data
 */
module.exports = async function () {
    try {
        const response = await fetchHcpFile()
        console.log(response)
    } catch (err) {
        console.log(err)
    }
    
}




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


