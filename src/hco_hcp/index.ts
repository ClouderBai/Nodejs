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
import dotenv from 'dotenv'
// dotenv.config({ debug: true })


class AuthorizationService {
    constructor() {}

    // async fetchSession() {
    //     // get .env
    //     const ENV = dotenv.parse(fs.readFileSync('.env'))
    //     const envJson = fsx.readJsonSync('.env.override')
    //     Object.assign(ENV, envJson)
    //     // const env = fsx.readFileSync(resolve(__dirname, '../../.env'))
    //     const diffTIme = moment().diff(moment(+ENV.SESSION_TIMESTAMP), 'minutes');
    //     console.log('Session Created Time Before:', diffTIme, 'minutes');
    //     if(diffTIme >= 60 * 2) {
    //         // fetch session
    //         // const response: any = await fetchSessionId()
    //         // if(!response.sessionId) throw response;
    //         // const session = response.sessionId;

    //         const session = ''
    //         const envOverride = {
    //             VEEVA_SESSION: session,
    //             SESSION_TIMESTAMP: `${moment().valueOf()}`
    //         }
    //         Object.assign(process.env, envOverride)
    //         fsx.writeJsonSync('.env.override', envOverride)
    //         console.log('refresh sessionId');
    //         return
    //     }
    //     console.log(`No Need Refresh SessionId`);
    // }
}

class DataSource {
    private _connection: Connection;
    private _idsPath = resolve(__dirname, './static/ids');
    private _jsonfile;
    public requestFunction;
    private _dataType: TypeEnum;
    private connectionManager: ConnectionManager;
    private _RequestMap = {
        [TypeEnum.HCPID]: fetchHcpByHcpId,
        [TypeEnum.HCPVEEVA]: fetchHcpByEntityId,
        [TypeEnum.HCOID]: fetchHcoByHcoId,
        [TypeEnum.HCOVEEVA]: fetchHcoByEntityId,
    }

    constructor() {
        this.connectionManager = getConnectionManager();
    }

    async getConnection() {
        if(this._connection) return this._connection;
        let connection: Connection;
        const hasConnection = this.connectionManager.has('default');
        if (hasConnection) connection = this.connectionManager.get('default');
        if (!connection.isConnected) return await connection.connect();

        const conn = await createConnection({
            name: 'default',
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

    setDataType(type: TypeEnum) {
        this._dataType = type;
        this.requestFunction = this._RequestMap[type];
    }

    setJsonFileDirectory(directory: string) { this._jsonfile = directory; }

    async fetchData() {
        const conn = await this.getConnection()
        const [sqlResult] = await conn.manager.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_hcp`)
        const { max: versionNumber } = sqlResult || {}
        const ids = fs.readFileSync(this._idsPath)
            .toString()
            .split('\r\n')
            .filter(v => !!v)
        console.log('----------ids-------------', ids.length)
        console.log(`-----------versionNumber: ${versionNumber}---------------------`)
        console.log(`-----------versionNumber + 1: ${versionNumber + 1}---------------------`)
        // split into chunk
        const chunks = _.chunk(ids, 20)

        for (const it of chunks) {
            // promise
            const promiseArr = it.reduce((promises, entityId) => {
                const item = this.requestFunction(entityId)
                promises.push(item)
                return promises
            }, [])
            // fetch data
            const response: any[] = await Promise.all(promiseArr)
            // write to local
            const VeevaHcpEntities: Entities.VeevaHcpEntity[] = []
            for (const res of response) {
                if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length === 1) {
                    const entity = res.entities[0]
                    if(this._jsonfile) fsx.writeJsonSync(`${this._jsonfile}/${entity.entityId}.json`, entity)
                    VeevaHcpEntities.push(Object.assign(new Entities.VeevaHcpEntity(), {
                        vnEntityId: entity.entityId,
                        jsonData: entity,
                        versionNumber: versionNumber + 1,
                    }))
                } else if (res.responseStatus == 'SUCCESS' && !res.entities) {
                    const index = response.findIndex(v => v == res)
                    const entityId = it[index]
                    if(this._jsonfile) fsx.writeJsonSync(`${this._jsonfile}/${entityId}.json`, {data: `not exist ${entityId}`})
                } else {
                    throw res
                }
            }
            await conn.manager.save(VeevaHcpEntities)
            console.log(`finish item ${it.toString()}`)
        }
    }
}
/**
 * fetch veeva hco data
 */
class Hco extends DataSource{
    constructor(){ super(); }

    /**
     * address
     */
    async transformHco({ version }: {version?:number} = {}) {
        const conn = await this.getConnection()
        // Truncate Table
        await conn.query(SQL.SrcDeleteData)
        await conn.query(SQL.SrcResetSequence)
        // data
        const [{max: maxVersion }] = await conn.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_hcp`)
        if(!version) version = maxVersion
        const jsonhcps = await conn.manager.find(Entities.VeevaHcpEntity, { where: { versionNumber: version }})
        console.log('----------jsonhcps-------------', jsonhcps.length)
        // handle
        const result = []
        for (const info of jsonhcps) {
            const { jsonData: { entity } } = (info as any);
            const mSrcHco = plainToClass(MSrcHcoModel, entity);
            mSrcHco.setAddress();
            mSrcHco.setParentHco();
            if (mSrcHco.hcoId) result.push(new MSrcHcoEntity(mSrcHco));
        }
        await conn.manager.save(result)

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

            MHcoEntities.push(currHco as any as MHcoEntity);

        }
        const insertHco = await conn.manager.save(MHcoEntity, MHcoEntities);
        console.log('----------insertHco-------------', insertHco)
    }
}

 
class Hcp extends DataSource {

    constructor() { super(); }

    /**
     * address
     */
    async transformHcp({ version }: { version?: number} = {}) {
        const conn = await this.getConnection()
        // Truncate Table
        await conn.query(SQL.SrcDeleteData)
        await conn.query(SQL.SrcResetSequence)
        // base code
        const baseCodeList = await conn.manager.find(Entities.MBaseCodeEntity, { where: { sttsInd: 1 }, relations: ['baseCtgry']})
        const ctgryGroup = _.groupBy(baseCodeList, v => v.baseCtgry.ctgryEnglshName)
        const codeMap = {}
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(_.map(v, 'code'), _.map(v, 'name')))
        // data source
        const [{max: versionNumber }] = await conn.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_hcp`)
        const maxVersion = version || versionNumber
        const jsonhcps = await conn.manager.find(Entities.VeevaHcpEntity, { where: { versionNumber: maxVersion }})
        console.log('----------jsonhcps-------------', jsonhcps.length)
    
        const hcpEntities = []
        const refEntities = []
        for (const info of jsonhcps) {
            const { jsonData: { entity } } = (info as any);
            const newModel = plainToClass(MSrcHcpModel, entity);
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
        
        await conn.manager.save(refEntities)
        const [insertHcpRes, insertHcpCount] = await conn.manager.save(hcpEntities)
        console.log('----------insertHcpRes-------------', insertHcpRes)
        console.log('----------insertHcpCount-------------', insertHcpCount)
        const hcoCount = await conn.manager.query(`SELECT Count(1) FROM cmd_owner.m_hco WHERE vn_entity_id IN (SELECT hco_vn_entity_id FROM cmd_owner.m_src_ref_hcp_hco)`)
        console.log('----------hcoCount-------------', hcoCount)
        await conn.query(SQL.SrcRef2RefSQL)
    
        console.log('----------successfully-------------', 'successfully')
    }
}


enum HcpClassificationCodeEnums {
    NON_CLINICIAN_PHYSICIAN = 'C480',
    CLINICIAN_PHYSICIAN = 'C479',
}

enum TypeEnum {
    HCPID = 'HCPID',
    HCPVEEVA = 'HCPVEEVA',
    HCOID = 'HCOID',
    HCOVEEVA = 'HCOVEEVA',
}

export const main = async () => {
    // const auth = new AuthorizationService();
    // await auth.fetchSession()


    // const dataSource = new DataSource()
    // dataSource.setDataType(TypeEnum.HCOVEEVA);
    // dataSource.setJsonFileDirectory(resolve(__dirname, './static/json_data'));
    // await dataSource.fetchData()


    // const hco = new Hco()
    // await hco.transformHco(/* { version: 1 } */)

    const hcp = new Hcp()
    await hcp.transformHcp({ version: 2 })
}
