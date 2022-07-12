import dotenv from 'dotenv'
import 'dotenv/config'
// dotenv.config({ debug: true })
import { 
    main 
// } from './src/formdata'
// } from './src/meituan'
} from './src/hco_hcp'
// } from './src/moment'




const fn = async() => {
    try {
        console.log('------------------------loading------------------------')
        await main()
        console.log('------------------------done------------------------')
    } catch (err) {
        console.log('------------------------err------------------------', err)
        console.error(err)
    }
}


fn()



