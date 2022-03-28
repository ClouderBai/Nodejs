import { main } from './src/hco_hcp'
import 'dotenv/config'
import dotenv from 'dotenv'
// dotenv.config({ debug: true })

const fn = async() => {
    try {
        console.log('------------------------loading------------------------')
        await main()
        console.log('------------------------done------------------------')
    } catch (err) {
        console.log('------------------------err------------------------')
        console.error(err)
    }
}


fn()



