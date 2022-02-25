import { main } from './src/hco_hcp'
import 'dotenv/config'


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



