const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')


try {

    const arr = xls.parse(fs.readFileSync(path.resolve(__dirname, 'file2.txt')))
    const data = arr[0].data
    console.log(data);
    const headers = data.shift()
    console.log(headers);
    const __selectAction__ = []
    data.forEach(v => {
        const item = {}
        headers.forEach((key, index) => {
            item[key] = v[index]
        })
        __selectAction__.push(item)
    })

    console.log(__selectAction__)
    const KeyMaps = {}
    let result = _.chain([__selectAction__])
        .forEach(group => {
            group.forEach(v => {
                if (v.buGk) {
                    if(v.nationalGk) KeyMaps[v.buGk] = true
                    if(v.regionGk) KeyMaps[`${v.buGk}-${v.nationalGk}`] = true
                    if(v.districtGk) KeyMaps[`${v.buGk}-${v.nationalGk}-${v.regionGk}`] = true
                    if (v.territoryGk) KeyMaps[`${v.buGk}-${v.nationalGk}-${v.regionGk}-${v.districtGk}`] = true
                }
            });
        })
        .map(group => {
            const filtered = group.filter(v => {
                if (v.buGk && !v.nationalGk && KeyMaps[v.buGk]) return false
                if (v.buGk && v.nationalGk && !v.regionGk && KeyMaps[`${v.buGk}-${v.nationalGk}`]) return false
                if (v.buGk && v.nationalGk && v.regionGk && !v.districtGk && KeyMaps[`${v.buGk}-${v.nationalGk}-${v.regionGk}`]) return false
                if (v.buGk && v.nationalGk && v.regionGk && v.districtGk && !v.territoryGk && KeyMaps[`${v.buGk}-${v.nationalGk}-${v.regionGk}-${v.districtGk}`]) return false
                return true
            })
            return filtered
        })
        .map(v =>
            v.reduce((pre, next) => {
                pre.push([
                    next.cycle,
                    next.buName,
                    next.buGk,
                    next.buSttsInd,
                    next.buEmplyName,
                    next.buEmplyGid,
                    next.buEmplyAcntName,
                    next.buEmplyEmail,
                    next.nationalName,
                    next.nationalGk,
                    next.nationalSttsInd,
                    next.nationalDmmy,
                    next.nationalEmplyName,
                    next.nationalEmplyGid,
                    next.nationalEmplyAcntName,
                    next.nationalEmplyEmail,
                    next.regionName,
                    next.regionGk,
                    next.regionSttsInd,
                    next.regionDmmy,
                    next.regionEmplyName,
                    next.regionEmplyGid,
                    next.regionEmplyAcntName,
                    next.regionEmplyEmail,
                    next.districtName,
                    next.districtGk,
                    next.districtSttsInd,
                    next.districtDmmy,
                    next.districtEmplyName,
                    next.districtEmplyGid,
                    next.districtEmplyAcntName,
                    next.districtEmplyEmail,
                    next.territoryName,
                    next.territoryGk,
                    next.territorySttsInd,
                    next.territoryDmmy,
                    next.territoryType,
                    next.territoryEmplyName,
                    next.territoryEmplyGid,
                    next.territoryEmplyAcntName,
                    next.territoryEmplyEmail,
                    next.cityName,
                    next.sleeveName,
                    next.territoryProductTeam,
                    next.taName,
                ])
                return pre;
            }, [])
        )
        .flatMap()
        .value()

    result = result.filter(v => v[2] == '9')
    console.log('----------result-------------', result)





} catch (err) {
    console.log(err);
}