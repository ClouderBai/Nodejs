import { createConnection } from "typeorm";
import * as Entities from '../hco_hcp/entities'




export async function main() {
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

    const veevaEntityRepository = conn.getRepository(Entities.VeevaHcpEntity)

    const veevaEntity = await veevaEntityRepository.findOne({ where: { id: 74 }})

    veevaEntity.createdDate = null;
    veevaEntity.createdUser = null;

    const res = await veevaEntityRepository.save([veevaEntity])

    console.log('----------res-------------', res)
}