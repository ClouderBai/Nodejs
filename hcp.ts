/* global __dirname */
const _ = require('lodash')
const fs = require('fs')
const fsx = require('fs-extra')
const { fetchHcp } = require('./api/veeva')
const { loadFile } = require('./common/load_file')
const { transformDBType } = require('./common/type')

/**
 * fetch veeva hco data
 */
const fetchHcoDate = async () => {
    const hcpIds = fs.readFileSync('./static/hcp/hcp-id.txt')
        .toString()
        .replace(/\r|\n/g, '')
        .split(',')
    console.log('----------hcpIds-------------', hcpIds.length)
    // list already exist in hco directory
    const fileNameExist = fsx.readdirSync('./static/hcp/source')
    // filter vnEntityId
    // const vnEntityIdsFiltered = _.filter(vnEntityIds, (vnEntityId) => !fileNameExist.includes(vnEntityId))
    const hcpIdsFiltered = _.filter(hcpIds, (hcpId) => !fileNameExist.includes(`${hcpId}.json`))
    
    // split into chunk
    const chunks = _.chunk(hcpIdsFiltered, 10)

    for (const it of chunks) {
        // promise
        const promiseArr = it.reduce((promises, hcpId) => {
            const item = fetchHcp(hcpId)
            promises.push(item)
            return promises
        }, [])
        // fetch data
        const response = await Promise.all(promiseArr)
        // write to local
        for (const res of response) {
            if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length > 0) {
                const entities = res.entities
                fsx.writeJsonSync(`./static/hcp/source/${entities[0].entityId}.json`, res)
            } else {
                throw new Error(`${it.toString()} Get Error: response error`)
            }
        }
        console.log(`finish item ${it.toString()}`)
    }
}



/**
 * handle hco data
 */
const handleHcoData = async () => {
    const baseCodeCtgry = loadFile('./static/csv/m_base_code_ctgry.csv')
    const baseCode = loadFile('./static/csv/m_base_code.csv')
    const baseCodeGroup = _.groupBy(baseCode, 'base_ctgry_id')
    const ctgryMapCode = Object.keys(baseCodeGroup).reduce((acc, key) => {
        acc[key] = baseCodeGroup[key].reduce((total, next) => {
            if(next.stts_ind === '1') total[next.code] = next.name
            return total
        }, {})
        return acc
    }, {});
    
    const ctgryMap = baseCodeCtgry.reduce((total, next) => {
        total[next.ctgry_englsh_name] = ctgryMapCode[next.base_code_ctgry_id]
        return total
    }, {})

    const fileName = fsx.readdirSync('./static/hcp/source')
    console.log(fileName)
    // let parentHcos = []
    for (const filename of fileName) {
        const entityInfo = fsx.readJsonSync(`./static/hcp/source/${filename}`)
        const hcpInfo = entityInfo.entities[0].entity

        const field = {}

        Object.assign(field, {
            vn_entity_id: hcpInfo.master_vid__v,
            hcp_id: hcpInfo.lilly_hcp_id__c.replace(/CN-|HCP/g, ''),
            given_name: hcpInfo.first_name__v,
            fmly_name: hcpInfo.last_name__v,
            full_name: hcpInfo.last_name__v + hcpInfo.first_name__v,
            alias_name: hcpInfo.pinyin_name__v,
            gender: hcpInfo.gender__v === 'M' ? 1 : 0,
            clssfctn_cd: hcpInfo.hcp_classification__c,
            clssfctn_name: ctgryMap['HCPClassification'][hcpInfo.hcp_classification__c],
            clinician: hcpInfo.hcp_classification__c === 'C479' ? 1 : 0,
            sub_clssfctn_cd: hcpInfo.hcp_sub_classification__c,
            sub_clssfctn_name: ctgryMap['HCPSubClassification'][hcpInfo.hcp_sub_classification__c],
            acad_cd: hcpInfo.academic_title__v,
            acad_title: ctgryMap['HCPAcademicTitle'][hcpInfo.academic_title__v],
            prof_cd: hcpInfo.professional_title__v,
            prof_title: ctgryMap['HCPProfessionalTitle'][hcpInfo.professional_title__v],
            createddate: hcpInfo.created_date__v,
            createduser: 'system',
            modifieddate: hcpInfo.modified_date__v,
            modifieduser: 'system',
            stts_ind: (hcpInfo.hcp_status__v === 'A' || hcpInfo.hcp_status__v === 'U') ? 1 : 0, // hcp_stts_cd
            hcp_stts_cd: hcpInfo.hcp_status__v,
            hcp_stts_name: ctgryMap['HCPStatus'][hcpInfo.hcp_status__v],
            hcp_typ_cd: hcpInfo.hcp_type__v,
            hcp_typ_name: ctgryMap['HCPType'][hcpInfo.hcp_type__v],
            spclty_cd: hcpInfo.specialty_1__v,
            spclty_name: ctgryMap['Specialty'][hcpInfo.specialty_1__v],
            // parentHcos: hcpInfo.parent_hcos__v,
            prmry_dprtmnt_cd: hcpInfo.primary_department_class__v,
            prmry_dprtmnt_name: ctgryMap['DepartmentClass'][hcpInfo.primary_department_class__v],
            // licenses: hcpInfo.licenses__v,
            license_cd: hcpInfo.licenses__v[0] && hcpInfo.licenses__v[0].license_number__v || null,
            efctv_strt_dt: new Date(),
            efctv_end_dt: null,
            merged_date: null,
            isdeleted: false,
            rcrd_state_cd: hcpInfo.record_state__v,
            rcrd_state_name: ctgryMap['AffiliationRole'][hcpInfo.record_state__v],
            // merged_to

        })
        fsx.writeJsonSync(`./static/hcp/field/${hcpInfo.master_vid__v}.json`, field)
        // parentHcos.push(...hcpInfo.parent_hcos__v.map(v => v.parent_hco_vid__v))
    }
    // parentHcos
}




/**
 * generate hco insert sql
 */
const generateHcoInsertSQL = async () => {
    const fileName = fsx.readdirSync('./static/hcp/field')
    console.log(fileName)
    for (const filename of fileName) {
        const info = fsx.readJsonSync(`./static/hcp/field/${filename}`)
        
        const keys = Object.keys(info)
        const fields = keys.join(`, `);
        const values = keys.map((key) => transformDBType(info[key]))

        // const updateSql = keys.map((key) => `${key}=${transformDBType(info[key])}`)

        let sql = `INSERT INTO cmd_owner.m_hcp (${fields}) VALUES(${values});\r\n`

        fsx.appendFileSync(`./static/hcp/sql/hcp_insert.sql`, sql)
    }
}


/**
 * generate ref hco_hcp data
 */
const generateRefData = async () => {
    // base code.
    const baseCodeCtgry = loadFile('./static/csv/m_base_code_ctgry.csv')
    const baseCode = loadFile('./static/csv/m_base_code.csv')
    const baseCodeGroup = _.groupBy(baseCode, 'base_ctgry_id')
    const ctgryMapCode = Object.keys(baseCodeGroup).reduce((acc, key) => {
        acc[key] = baseCodeGroup[key].reduce((total, next) => {
            if(next.stts_ind === '1') total[next.code] = next.name
            return total
        }, {})
        return acc
    }, {});
    
    const ctgryMap = baseCodeCtgry.reduce((total, next) => {
        total[next.ctgry_englsh_name] = ctgryMapCode[next.base_code_ctgry_id]
        return total
    }, {})

    // fetch hco
    const hcoMap = {}
    const hcoFileName = fsx.readdirSync('./static/hco/source')
    for (const hcoFile of hcoFileName) {
        const hcoInfo = fsx.readJsonSync(`./static/hco/source/${hcoFile}`)
        const [hco] = hcoInfo
        const { entity } = hco
        hcoMap[entity.master_vid__v] = entity
    }
    
    // fetch hcp
    const fileName = fsx.readdirSync('./static/hcp/source')
    console.log(fileName)
    // let parentHcos = []
    for (const filename of fileName) {
        const entityInfo = fsx.readJsonSync(`./static/hcp/source/${filename}`)
        const hcpInfo = entityInfo.entities[0].entity

        const field = {}

        Object.assign(field, {
            vn_entity_id: hcpInfo.master_vid__v,
            hcp_id: hcpInfo.lilly_hcp_id__c.replace(/CN-|HCP/g, ''),
            parentHcos: hcpInfo.parent_hcos__v,
        })

        const fields = field.parentHcos.reduce((total, next) => {
            total.push({
                // ref_hcp_hco_id: entity.Error,
                is_prmry: next.is_primary_relationship__v === 'Y' ? 1 : 0,
                afltn_role_cd: next.afltn_role__c,
                afltn_role_name: ctgryMap['AffiliationRole'][next.afltn_role__c],
                hcp_id: field.hcp_id,
                hco_id: hcoMap[next.parent_hco_vid__v].lilly_hco_id__c.replace(/CN-|HCO/g, ''),
                prnt_hco_stts: next.parent_hco_status__v,
                rcrd_state_cd: next.record_state__v,
                is_veeva_master: next.is_veeva_master__v,
            })
            return total;
        }, [])
        
        fsx.writeJsonSync(`./static/ref/fields/${hcpInfo.master_vid__v}.json`, fields)
    }
}

/**
 * generate ref insert sql
 */
const generateRefInsertSQL = async () => {
    const fileName = fsx.readdirSync('./static/ref/fields')
    console.log(fileName)

    const infos = []
    for (const filename of fileName) {
        const info = fsx.readJsonSync(`./static/ref/fields/${filename}`)
        infos.push(...info)
    }

    const info1 = _.uniqWith(infos, _.isEqual)
    
    for (const item of info1) {
        const keys = Object.keys(item)
        const fields = keys.join(`, `);
        const values = keys.map((key) => transformDBType(item[key]))
    
        // const updateSql = keys.map((key) => `${key}=${transformDBType(info[key])}`)
    
        let sql = `INSERT INTO cmd_owner.m_ref_hcp_hco (${fields}) VALUES(${values});\r\n`
    
        fsx.appendFileSync(`./static/ref/sql/ref_insert.sql`, sql)
    }
}

/**
 * main
 */
 module.exports = async function main() {
    // await fetchHcoDate()
    // await handleHcoData()
    // await generateHcoInsertSQL()
    // await generateRefData()
    await generateRefInsertSQL()
    
}


