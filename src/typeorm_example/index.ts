import { createConnection } from 'typeorm';
export const main = async() => {

    try {
        const connection = await createConnection({
            type: 'postgres',
            schema: 'cmd_owner',
            database: 'cmds',
            host: '127.0.0.1',
            port: 5432,
            username: 'postgres',
            password: 'Win2008',
            ssl: false,
        })
    
        const result = await connection.query(`
            CALL cmd_owner.p_hcm_open_person('V_INPUT_SUCCESS');
        `)
    
        console.log('----------result-------------', result)
        
    } catch (err) {
        console.log('----------err-------------', err)
    }
}