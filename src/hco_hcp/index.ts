import { plainToClass } from 'class-transformer'
import fsx from 'fs-extra'
import fs from 'fs'
import _ from 'lodash'
import { fetchHcpByHcpId, fetchHcoByEntityId } from '../../api/veeva'
import { createConnection } from 'typeorm'
import { MHcoEntity, MHcpEntity, MSrcHcoEntity, MSrcRefHcpHcoEntity } from './entities'
import * as Entities from './entities'
import { MSrcHcoModel } from './model'
import { MSrcHcpModel } from './model/m-src-hcp.model'
import * as SQL from './sql'
import moment from 'moment'



class DataSource {
    private _connection;

    async getConnection() {
        if(this._connection) return this._connection;

        const conn = await createConnection({
            "type": "postgres",
            "schema": "cmd_owner",
            "database": "cmds",
            "host": "127.0.0.1",
            "port": 5432,
            "username": "postgres",
            "password": "Win2008",
            "entities": Object.values(Entities),
        })
        this._connection = conn;
        return conn
    }
}
/**
 * fetch veeva hco data
 */
class Hco {

    private _connection;

    constructor(){}

    async getConnection() {
        if(this._connection) return this._connection;

        const conn = await createConnection({
            "type": "postgres",
            "schema": "cmd_owner",
            "database": "cmds",
            "host": "127.0.0.1",
            "port": 5432,
            "username": "postgres",
            "password": "Win2008",
            "entities": Object.values(Entities),
        })
        this._connection = conn;
        return conn
    }

    async fetchHcoData() {
        const vnEntityIds = fs.readFileSync('./src/hco_hcp/static/hco/vn_entity_id')
            .toString()
            .replace(/\r|\n/g, '')
            .split(',')
        console.log('----------vnEntityIds-------------', vnEntityIds.length)
        // list already exist in hco directory
        const fileNameExist = fsx.readdirSync('./src/hco_hcp/static/hco/source')
        // filter vnEntityId
        const vnEntityIdsFiltered = _.filter(vnEntityIds, (vnEntityId) => !fileNameExist.includes(`${vnEntityId}.json`))
        // const vnEntityIdsFiltered = vnEntityIds
        // split into chunk
        const chunks = _.chunk(vnEntityIdsFiltered, 20)

        for (const it of chunks) {
            // promise
            const promiseArr = it.reduce((promises, entityId) => {
                const item = fetchHcoByEntityId(entityId)
                promises.push(item)
                return promises
            }, [])
            // fetch data
            const response: any[] = await Promise.all(promiseArr)
            // write to local
            for (const res of response) {
                if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length === 1) {
                    const entities = res.entities
                    fsx.writeJsonSync(`./src/hco_hcp/static/hco/source/${res.entities[0].entityId}.json`, entities[0])
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
    async transformHco() {
        const conn = await this.getConnection()

        const fileName = fsx.readdirSync('./src/hco_hcp/static/hco/source')
        console.log(fileName)
        const result = []
        for (const filename of fileName) {
            const info = fsx.readJsonSync(`./src/hco_hcp/static/hco/source/${filename}`)
            const { entity } = info;
            const mSrcHco = plainToClass(MSrcHcoModel, entity);
            mSrcHco.setAddress();
            mSrcHco.setParentHco();
            if (mSrcHco.hcoId) {
                result.push(new MSrcHcoEntity(mSrcHco));
            }
        }
        // await conn.manager.save(result)
        const baseCodeList = await conn.manager.find(Entities.MBaseCodeEntity, { where: { sttsInd: 1 }, relations: ['baseCtgry']})
        const ctgryGroup = _.groupBy(baseCodeList, v => v.baseCtgry.ctgryEnglshName)
        const codeMap = _.cloneDeep(ctgryGroup)
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(v.map(v => v.code), v.map(v => v.name)))

        const srcHcoEntities = await conn.manager.find(Entities.MSrcHcoEntity)
        const prvncList = await conn.manager.find(Entities.MPrvncEntity)
        const cityList = await conn.manager.find(Entities.MCityEntity)
        const cntyList = await conn.manager.find(Entities.MCntyEntity)

        for (const currHco of srcHcoEntities) {

            Object.assign(currHco, {
                hcoCd: currHco.hcoId.toString(),
                subClsfctnName: codeMap?.['HCOSubClassification']?.[currHco.subClsfctnCd],
                clsfctnName: codeMap?.['HCOIndustryClassification']?.[currHco.clsfctnCd],
                hcoSttsName: codeMap?.['HCOStatus']?.[currHco.hcoSttsCd],
                hcoTypeName: codeMap?.['HCOType']?.[currHco.hcoTypeCd],
                sttsInd: currHco.hcoSttsCd === 'A' || currHco.hcoSttsCd === 'U' ? 1 : 0,
                createdDate: new Date(),
                createdUser: 'system',
            })            
            const prvncObj = _.find(prvncList, { prvncCd: currHco.prvncCd });
            currHco.prvncName = prvncObj.prvncName || null;
            const cityObj = prvncObj && _.find(cityList, { prvncCd: prvncObj.prvncCd, cityName: currHco.cityName });
            currHco.cityCd = cityObj ? cityObj.cityCd : null;
            const cntyObj = cityObj && (_.find(cntyList, { cityCd: cityObj.cityCd, cntyName: currHco.cntyName }));
            currHco.cntyCd = cntyObj ? cntyObj.cntyCd : null;


            const insertHco = await conn.manager.save(MHcoEntity, currHco);
            console.log('----------insertHco-------------', insertHco)
        }
    }
}


class Hcp extends DataSource {
    constructor() {
        super();
    }
    /**
     * fetch veeva hcp data
     */
    async fetchHcpData() {
        const conn = await this.getConnection()

        const vnEntityIds = fs.readFileSync('./src/hco_hcp/static/vn_entity_id')
            .toString()
            .replace(/\r|\n/g, '')
            .split(',')
        console.log('----------vnEntityIds-------------', vnEntityIds.length)
        // list already exist in hco directory
        const fileNameExist = fsx.readdirSync('./src/hco_hcp/static/source')
        // filter vnEntityId
        const vnEntityIdsFiltered = _.filter(vnEntityIds, (vnEntityId) => !fileNameExist.includes(`${vnEntityId}.json`))
        // const vnEntityIdsFiltered = vnEntityIds
        // split into chunk
        const chunks = _.chunk(vnEntityIdsFiltered, 20)

        for (const it of chunks) {
            // promise
            const promiseArr = it.reduce((promises, entityId) => {
                const item = fetchHcpByHcpId(entityId)
                promises.push(item)
                return promises
            }, [])
            // fetch data
            const response: any[] = await Promise.all(promiseArr)
            // write to local
            for (const res of response) {
                if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length === 1) {
                    const entity = res.entities[0]
                    await conn.manager.save(Object.assign(new Entities.VeevaHcpEntity(), {
                        vnEntityId: entity.entityId,
                        veevaData: entity
                    }))
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
    async transformHcp() {
        const conn = await this.getConnection()
        await conn.query(SQL.SrcDeleteData)
        await conn.query(SQL.SrcResetSequence)
        // base code
        const baseCodeList = await conn.manager.find(Entities.MBaseCodeEntity, { where: { sttsInd: 1 }, relations: ['baseCtgry']})
        const ctgryGroup = _.groupBy(baseCodeList, v => v.baseCtgry.ctgryEnglshName)
        const codeMap = _.cloneDeep(ctgryGroup)
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(v.map(v => v.code), v.map(v => v.name)))
        // data source
        const jsonhcps = await conn.manager.find(Entities.VeevaHcpEntity)
        console.log('----------jsonhcps-------------', jsonhcps.length)
    
        const hcpEntities = []
        for (const info of jsonhcps) {
            const { veevaData: { entity } } = info;
            const newModel = plainToClass(MSrcHcpModel, entity);
            newModel.setLicenses();
            
            const srcHcpEntities = await conn.manager.save(new Entities.MSrcHcpEntity(newModel))
    
            const hcpEntity = new MHcpEntity(newModel);
            Object.assign(hcpEntity, {
                gender: newModel.gender === 'M' ? 1 : 0,
                fullName: hcpEntity.fmlyName + hcpEntity.givenName,
                clinician: hcpEntity.clssfctnCd === HcpClassificationCodeEnums.CLINICIAN_PHYSICIAN ? 1 : 0,
                hcpTypName: ctgryGroup?.['HCPType']?.[hcpEntity.hcpTypCd],
                subClssFctnName: codeMap?.['HCPSubClassification']?.[hcpEntity.subClssFctnCd],
                clssfctnName: codeMap?.['HCPClassification']?.[hcpEntity.clssfctnCd],
                hcpSttsName: codeMap?.['HCPStatus']?.[hcpEntity.hcpSttsCd],
                acadTitle: codeMap?.['HCPAcademicTitle']?.[hcpEntity.acadCd],
                profTitle: codeMap?.['HCPProfessionalTitle']?.[hcpEntity.profCd],
                spcltyName: codeMap?.['Specialty']?.[hcpEntity.spcltyCd],
                prmryDprtmntName: codeMap?.['DepartmentClass']?.[hcpEntity.prmryDprtmntCd],
                sttsInd: hcpEntity.hcpSttsCd === 'A' || hcpEntity.hcpSttsCd === 'U' ? 1 : 0,
                refHcpHcos: [],
                createdDate: moment().utc().toDate(),
                createdUser: 'manual',
                modifiedDate: moment().utc().toDate(),
                modifiedUser: 'manual',
            })
                
            hcpEntities.push(hcpEntity);
    
            const ref = newModel.parentHcos.map(item => new MSrcRefHcpHcoEntity({
                    hcpId: srcHcpEntities.id,
                    isPrmry: item.is_primary_relationship__v === 'Y' ? 1 : 0,
                    afltnRoleCd: item.afltn_role__c,
                    hcoVnEntityId: item.parent_hco_vid__v,
                    prntHcoStts: item.parent_hco_status__v,
                    rcrdStateCd: item.record_state__v,
                    isVeevaMaster: item.is_veeva_master__v,
                })
            )
    
            await conn.manager.save(ref)
        }
        
        await conn.manager.save(hcpEntities)
        await conn.query(SQL.SrcRef2RefSQL)
    
        console.log('----------successfully-------------', 'successfully')
    }
}


enum HcpClassificationCodeEnums {
    NON_CLINICIAN_PHYSICIAN = 'C480',
    CLINICIAN_PHYSICIAN = 'C479',
}




export const main = async () => {
    // await fetchHcoData()
    // await transformHco()
    
    const hcp = new Hcp()
    // await fetchHcpData()
    await hcp.transformHcp()
}
