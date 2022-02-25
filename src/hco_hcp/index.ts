import { plainToClass } from 'class-transformer'
import fsx from 'fs-extra'
import fs from 'fs'
import _ from 'lodash'
import { fetchHcpByHcpId, fetchHcoByEntityId, fetchHcpByEntityId, fetchHcoByHcoId, fetchSessionId } from '../../api/veeva'
import { createConnection } from 'typeorm'
import { MHcoEntity, MHcpEntity, MSrcHcoEntity, MSrcRefHcpHcoEntity } from './entities'
import * as Entities from './entities'
import { MSrcHcoModel } from './model'
import { MSrcHcpModel } from './model/m-src-hcp.model'
import * as SQL from './sql'
import moment from 'moment'
import { resolve } from 'path'


class AuthorizationService {
    constructor() {}

    async fetchSession() {
        // get .env
        const env = fsx.readFileSync(resolve(__dirname, '../../.env'))
        const str = env.toString();
        const strArray = str.split('\r\n').filter(v => !!v).filter(v => !/^#[^#]+/gi.test(v));
        const timestamp = strArray.find(v => /TIMESTAMP=([0-9]+)/.test(v)).replace(/TIMESTAMP=([0-9]+)/, `$1`)
        const diffTIme = moment().diff(moment(+timestamp), 'minutes');
        console.log('Session Created Time Before:', diffTIme, 'minutes');
        if(diffTIme >= 60) {
            // fetch session
            const response: any = await fetchSessionId()
            const session = response.sessionId;
            // replace session
            const replaced = str.replace(/(VEEVA_SESSION=)[^\n]*/g, `$1${session}`)
            fsx.writeFileSync(resolve(__dirname, '../../.env'), replaced)
            console.log('refresh sessionId');
            process.env.VEEVA_SESSION = session;
            return
        }
        console.log(`No Need Refresh SessionId`);
    }
}

class DataSource {
    private _connection;
    private _idsPath = resolve(__dirname, './static/ids');
    private _jsonfile;
    public requestFunction;
    private _dataType: TypeEnum;
    private _RequestMap = {
        [TypeEnum.HCPID]: fetchHcpByHcpId,
        [TypeEnum.HCPVEEVA]: fetchHcpByEntityId,
        [TypeEnum.HCOID]: fetchHcoByHcoId,
        [TypeEnum.HCOVEEVA]: fetchHcoByEntityId,
    }

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

    setDataType(type: TypeEnum) {
        this._dataType = type;
        this.requestFunction = this._RequestMap[type];
    }

    setJsonFileDirectory(directory: string) { this._jsonfile = directory; }

    async fetchData() {
        const conn = await this.getConnection()
        const sqlResult = await conn.manager.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_hcp`)
        const { max: versionNumber } = sqlResult || {}
        const ids = fs.readFileSync(this._idsPath)
            .toString()
            .split('\r\n')
            .filter(v => !!v)
        console.log('----------ids-------------', ids.length)
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
            for (const res of response) {
                if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length === 1) {
                    const entity = res.entities[0]
                    if(this._jsonfile) fsx.writeJsonSync(`${this._jsonfile}/${entity.entityId}.json`, entity)
                    await conn.manager.save(Object.assign(new Entities.VeevaHcpEntity(), {
                        vnEntityId: entity.entityId,
                        veevaData: entity,
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
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(_.map(v, 'code'), v.map(v, 'name')))

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

    constructor() { super(); }

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
        _.each(ctgryGroup, (v, k) => codeMap[k] = _.zipObject(_.map(v, 'code'), _.map(v, 'name')))
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

enum TypeEnum {
    HCPID = 'HCPID',
    HCPVEEVA = 'HCPVEEVA',
    HCOID = 'HCOID',
    HCOVEEVA = 'HCOVEEVA',
}

export const main = async () => {
    // session
    const auth = new AuthorizationService();
    await auth.fetchSession()

    // fetch data
    const dataSource = new DataSource()
    dataSource.setDataType(TypeEnum.HCOVEEVA);
    dataSource.setJsonFileDirectory(resolve(__dirname, './static/json_data'));
    await dataSource.fetchData()

    // const hco = new Hco()
    // await transformHco()

    // const hcp = new Hcp()
    // await hcp.transformHcp()
}
