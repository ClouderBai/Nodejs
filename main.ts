import dotenv from 'dotenv';
import { request } from './common/request';
import { main } from './src/hco_hcp'


dotenv.config({ debug: true })


const fn = async() => {
    try {
        console.log('------------------------loading------------------------')
        await main()
        console.log('------------------------done------------------------')
    } catch (err) {
        console.log('------------------------err------------------------', err)
    }
}


fn()



