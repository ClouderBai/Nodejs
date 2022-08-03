import { plainToClass } from 'class-transformer'
import fsx from 'fs-extra'
import fs from 'fs'
import _ from 'lodash'
import { fetchHcpByHcpId, fetchHcoByEntityId, fetchHcpByEntityId, fetchHcoByHcoId, fetchSessionId } from '../../api/veeva'
import { Connection, ConnectionManager, createConnection, getConnection, getConnectionManager } from 'typeorm'
import { MHcoEntity, MHcpEntity, MSrcHcoEntity, MSrcRefHcpHcoEntity } from './entities'
import * as Entities from './entities'
import { MSrcHcoModel } from './model'
import { MSrcHcpModel } from './model/m-src-hcp.model'
import * as SQL from './sql'
import moment from 'moment'
import { resolve } from 'path'
import 'dotenv/config'


/**
 * fetch veeva hco data
 */
class Hco {
    private _datasource: DataSource

    constructor(){
        this._datasource =  new DataSource()
    }

    /**
     * address
     */
    async transformHco({ version }: {version?:number} = {}) {
        if(!version) throw new Error('version is required')
        const conn = await this._datasource.getConnection();
        // Truncate Table
        await conn.query(SQL.SrcDeleteData)
        await conn.query(SQL.SrcResetSequence)

        const jsonEntities = await conn.manager.find(Entities.VeevaOriginDataEntity, { where: { versionNumber: version }})
        // handle
        for (const info of jsonEntities) {
            const { jsonData: { entities } } = (info as any);
            for (const item of entities) {
                const mSrcHco = plainToClass(MSrcHcoModel, item.entity);
                mSrcHco.setAddress();
                mSrcHco.setParentHco();
                if (mSrcHco.hcoId) await conn.manager.save(new MSrcHcoEntity(mSrcHco))
                else console.log('----------mSrcHco is empty-------------', mSrcHco)
            }
        }

        // base code
        const baseCodeList = await conn.manager.find(Entities.MBaseCodeEntity, { where: { sttsInd: 1 }, relations: ['baseCtgry']})
        const ctgryGroup = _.groupBy(baseCodeList, v => v.baseCtgry.ctgryEnglshName)
        const codeMap = {}
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(v.map(v => v.code), v.map(v => v.name)))
        
        // src TO  m_hco
        const srcHcoEntities = await conn.manager.find(Entities.MSrcHcoEntity)
        const prvncList = await conn.manager.find(Entities.MPrvncEntity)
        const cityList = await conn.manager.find(Entities.MCityEntity)
        const cntyList = await conn.manager.find(Entities.MCntyEntity)

        const MHcoEntities: MHcoEntity[] = []
        for (const currHco of srcHcoEntities) {
            Object.assign(currHco, {
                rcrdStateName: codeMap?.['RecordStatus']?.[currHco.rcrdStateCd],
                hcoCd: currHco.hcoCd,
                subClsfctnName: codeMap?.['HCOSubClassification']?.[currHco.subClsfctnCd],
                clsfctnName: codeMap?.['HCOIndustryClassification']?.[currHco.clsfctnCd],
                hcoSttsName: codeMap?.['HCOStatus']?.[currHco.hcoSttsCd],
                hcoTypeName: codeMap?.['HCOType']?.[currHco.hcoTypeCd],
                sttsInd: currHco.hcoSttsCd === 'A' || currHco.hcoSttsCd === 'U' ? 1 : 0,
                createdDate: new Date(currHco.crtDt),
                createdUser: 'system',
            })            
            const prvncObj = _.find(prvncList, { prvncCd: currHco.prvncCd });
            currHco.prvncName = prvncObj.prvncName || null;
            const cityObj = prvncObj && _.find(cityList, { prvncCd: prvncObj.prvncCd, cityName: currHco.cityName });
            currHco.cityCd = cityObj ? cityObj.cityCd : null;
            const cntyObj = cityObj && (_.find(cntyList, { cityCd: cityObj.cityCd, cntyName: currHco.cntyName }));
            currHco.cntyCd = cntyObj ? cntyObj.cntyCd : null;

            MHcoEntities.push(currHco as any as MHcoEntity);

        }
        const insertHco = await conn.manager.save(MHcoEntity, MHcoEntities);
        console.log('----------insertHco-------------', insertHco.length)
    }
}

 
class Hcp {
    private _datasource: DataSource

    constructor() {
        this._datasource = new DataSource()
    }

    async transformHcp({ version }: { version?: number} = {}) {
        const conn = await this._datasource.getConnection();
        // Truncate Table
        await conn.query(SQL.SrcDeleteData)
        await conn.query(SQL.SrcResetSequence)
        // base code
        const baseCodeList = await conn.manager.find(Entities.MBaseCodeEntity, { where: { sttsInd: 1 }, relations: ['baseCtgry']})
        const ctgryGroup = _.groupBy(baseCodeList, v => v.baseCtgry.ctgryEnglshName)
        const codeMap = {}
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(_.map(v, 'code'), _.map(v, 'name')))
        // data source
        const jsonhcps = await conn.manager.find(Entities.VeevaOriginDataEntity, { where: { versionNumber: version }})
    
        const hcpEntities = []
        const refEntities = []
        for (const info of jsonhcps) {
            const { jsonData: { entities } } = (info as any);
            for (const item of entities) {
                const newModel = plainToClass(MSrcHcpModel, item.entity);
                newModel.setLicenses();
                const srcHcpEntities = await conn.manager.save(new Entities.MSrcHcpEntity(newModel))
                const hcpEntity = new MHcpEntity(newModel);
                

                Object.assign(hcpEntity, {
                    rcrdStateName: codeMap?.['RecordStatus']?.[hcpEntity.rcrdStateCd],
                    gender: newModel.gender === 'M' ? 1 : 0,
                    fullName: hcpEntity.fmlyName + hcpEntity.givenName,
                    clinician: hcpEntity.clssfctnCd === HcpClassificationCodeEnums.CLINICIAN_PHYSICIAN ? 1 : 0,
                    hcpTypName: codeMap?.['HCPType']?.[hcpEntity.hcpTypCd],
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
                refEntities.push(...ref)
            }
        }
        
        await conn.manager.save(refEntities)
        const [insertHcpRes, insertHcpCount] = await conn.manager.save(hcpEntities)
        console.log('----------insertHcpRes-------------', insertHcpRes)
        console.log('----------insertHcpCount-------------', insertHcpCount)
        const hcoCount = await conn.manager.query(`SELECT Count(1) FROM cmd_owner.m_hco WHERE vn_entity_id IN (SELECT hco_vn_entity_id FROM cmd_owner.m_src_ref_hcp_hco)`)
        console.log('----------hcoCount-------------', JSON.stringify(hcoCount))
        const missHco = await conn.query(SQL.SrcRef2MissHco)
        console.log('----------missing Hco entity id-------------', JSON.stringify(missHco.map(v => v.hco_vn_entity_id)))
        await conn.query(SQL.SrcRef2RefSQL)
    
        console.log('----------successfully-------------', 'successfully')
    }
}

enum HcpClassificationCodeEnums {
    NON_CLINICIAN_PHYSICIAN = 'C480',
    CLINICIAN_PHYSICIAN = 'C479',
}


import { hco } from './hco'
import { fetchDataByUrl } from './fetchByUrl'
import { fetchDataByIds } from './fetchDataByIds'
import { DataSource } from './dataSource'
export const main = async () => {
    // const auth = new AuthorizationService();
    // await auth.fetchSession()
    
    // const dataSource = new DataSource()
    // dataSource.setDataType(TypeEnum.HCOVEEVAURL);
    // dataSource.setJsonFileDirectory(resolve(__dirname, './static/json_data'));
    // await dataSource.fetchData();
    
    // const res = await fetchDataByUrl()
    // const res = await fetchDataByIds()

    // const hco = new Hco()
    // await hco.transformHco({ version: 4 })

    const hcp = new Hcp()
    await hcp.transformHcp({ version: 8 })
}


main()
    .then((res) => {
        console.log('----------res-------------', res)
    })
    .catch((err) => {
        console.log('----------err-------------', err)
    })