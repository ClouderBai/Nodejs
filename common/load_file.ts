const xlsx = require('node-xlsx')
const path = require('path')

export function loadFile(filePath) {
    // load file

    const xlsx_data = xlsx.parse(filePath, { raw: true })
    // load file data
    const data = xlsx_data[0].data
    console.log(data);
    // get headers
    const headers = data.shift()
    console.log(headers);
    // generate array
    const __selectAction__ = data.reduce((total, next) => {
        const item = {}
        headers.forEach((key, index) => {
            item[key] = next[index]
        })
        total.push(item)
        return total
    }, [])
    
    
    
    return __selectAction__;
}


