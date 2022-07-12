import { Connection, ConnectionManager, createConnection, getConnectionManager } from 'typeorm';
import * as Entities from './entities'

export class DataSource {
    private _connection: Connection;
    private connectionManager: ConnectionManager;
    private _version;

    constructor() {
        this.connectionManager = getConnectionManager();
    }

    async getConnection() {
        if(this._connection) return this._connection;
        let connection: Connection;
        const hasConnection = this.connectionManager.has('default');
        if (hasConnection) connection = this.connectionManager.get('default');
        if (connection && !connection.isConnected) return await connection.connect();

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


    async saveMetadata({data, type, url, offset = '0', limit = '100'}) {
        const conn = await this.getConnection()
        const saveResult = await conn.manager.save(Object.assign(new Entities.VeevaOriginDataEntity(), {
            startDate: '2022-2-16 01:00:00',
            endDate: '2022-2-18 01:00:00',
            offset,
            limit,
            jsonData: data,
            type,
            versionNumber: this._version,
            url: url,
            createdUser: 'system',
            modifiedUser: 'system',
        }))
        console.log('----------saveResult-------------', saveResult)
    }

    async addVersion() {
        const conn = await this.getConnection()
        const [sqlResult] = await conn.manager.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_origin_data`)
        const { max: maxVersion } = sqlResult || {}
        this._version = (maxVersion || 0) + 1;
    }

    async getVersion() {
        const conn = await this.getConnection()
        const [sqlResult] = await conn.manager.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_origin_data`)
        const { max: maxVersion } = sqlResult || {}
        this._version = (maxVersion || 0);
        return this._version;
    }
}




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

// class DataSource {
//     private _connection: Connection;
//     private _idsPath = resolve(__dirname, './static/ids');
//     private _jsonfile;
//     public requestFunction;
//     private _dataType: TypeEnum;
//     private connectionManager: ConnectionManager;
//     private _RequestMap = {
//         [TypeEnum.HCPID]: fetchHcpByHcpId,
//         [TypeEnum.HCPVEEVA]: fetchHcpByEntityId,
//         [TypeEnum.HCOID]: fetchHcoByHcoId,
//         [TypeEnum.HCOVEEVA]: fetchHcoByEntityId,
//     }

//     constructor() {
//         this.connectionManager = getConnectionManager();
//     }

//     async getConnection() {
//         if(this._connection) return this._connection;
//         let connection: Connection;
//         const hasConnection = this.connectionManager.has('default');
//         if (hasConnection) connection = this.connectionManager.get('default');
//         if (!connection.isConnected) return await connection.connect();

//         const conn = await createConnection({
//             name: 'default',
//             "type": "postgres",
//             "schema": "cmd_owner",
//             "database": "cmds",
//             "host": "127.0.0.1",
//             "port": 5432,
//             "username": "postgres",
//             "password": "Win2008",
//             "entities": Object.values(Entities),
//         })
//         this._connection = conn;
//         return conn
//     }

//     setDataType(type: TypeEnum) {
//         this._dataType = type;
//         this.requestFunction = this._RequestMap[type];
//     }

//     setJsonFileDirectory(directory: string) { this._jsonfile = directory; }

//     async fetchData() {
//         const conn = await this.getConnection()
//         const [sqlResult] = await conn.manager.query(`SELECT MAX(versionnumber) FROM cmd_owner.veeva_hcp`)
//         const { max: versionNumber } = sqlResult || {}
//         const ids = fs.readFileSync(this._idsPath)
//             .toString()
//             .split('\r\n')
//             .filter(v => !!v)
//         console.log('----------ids-------------', ids.length)
//         console.log(`-----------versionNumber: ${versionNumber}---------------------`)
//         console.log(`-----------versionNumber + 1: ${versionNumber + 1}---------------------`)
//         // split into chunk
//         const chunks = _.chunk(ids, 20)

//         for (const it of chunks) {
//             // promise
//             const promiseArr = it.reduce((promises, entityId) => {
//                 const item = this.requestFunction(entityId)
//                 promises.push(item)
//                 return promises
//             }, [])
//             // fetch data
//             const response: any[] = await Promise.all(promiseArr)
//             // write to local
//             const VeevaHcpEntities: Entities.VeevaHcpEntity[] = []
//             for (const res of response) {
//                 if(res.responseStatus == 'SUCCESS' && res.entities && res.entities.length === 1) {
//                     const entity = res.entities[0]
//                     if(this._jsonfile) fsx.writeJsonSync(`${this._jsonfile}/${entity.entityId}.json`, entity)
//                     VeevaHcpEntities.push(Object.assign(new Entities.VeevaHcpEntity(), {
//                         vnEntityId: entity.entityId,
//                         jsonData: entity,
//                         versionNumber: versionNumber + 1,
//                     }))
//                 } else if (res.responseStatus == 'SUCCESS' && !res.entities) {
//                     const index = response.findIndex(v => v == res)
//                     const entityId = it[index]
//                     if(this._jsonfile) fsx.writeJsonSync(`${this._jsonfile}/${entityId}.json`, {data: `not exist ${entityId}`})
//                 } else {
//                     throw res
//                 }
//             }
//             await conn.manager.save(VeevaHcpEntities)
//             console.log(`finish item ${it.toString()}`)
//         }
//     }
// }