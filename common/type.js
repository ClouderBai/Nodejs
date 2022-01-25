


const transformDBType = (value) => {
    const type = Object.prototype.toString.call(value)
    const config = {
        "[object String]": `'${value}'`,
        "[object Number]": `${value}`,
        "[object Undefined]": `NULL`,
        "[object Null]": `NULL`,
        "[object Boolean]": `${value}`,
    }
    return config[type]
}







module.exports = {
    transformDBType
}