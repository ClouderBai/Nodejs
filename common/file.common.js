// /* global __dirname */
const path = require('path')
const fs = require('fs')


async function rmdirAsync(filePath) {
    
    try {
        let stat = fs.statSync(filePath)
        if(stat.isFile()) {
            fs.unlinkSync(filePath)
        }else {
            let dirs = fs.readdirSync(filePath)
            dirs = dirs.map(dir => rmdirAsync(path.join(filePath, dir)))
            console.log('----------dirs-------------', dirs)
            Promise.all(dirs)
            fs.rmdirSync(filePath)
        }
    } catch (e) {
        console.log('----------e-------------', e)
    }
}

module.exports = {
    rmdirAsync,
}
