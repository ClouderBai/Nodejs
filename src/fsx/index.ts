import fsx from 'fs-extra'
import fs from 'fs';
import _ from 'lodash';

export const main = async () => {

    const dirs = fs.readdirSync('D:/oneDrive/Documents/CMDS/2022-2-17.18丢失数据')
    const hcoVids = []
    const entities = []
    for (const dir of dirs) {
        const hcp = fsx.readJsonSync(`D:/oneDrive/Documents/CMDS/2022-2-17.18丢失数据/${dir}`)
        
        entities.push(...hcp.entities)
        // hcp.entities[0].entity.parent_hcos__v[0].parent_hco_vid__v
    }

    const entity = entities.map(v => v.entity)
    const parent_hcos__v = entity.map(v => v.parent_hcos__v).flat()
    const parent_hco_vid__v = parent_hcos__v.map(v => v.parent_hco_vid__v)
    const parent_hco_vid__v_1 = _.uniq(parent_hco_vid__v)
    const chunks = _.chunk(parent_hco_vid__v_1, 1000)
    for (const [key, chunk] of Object.entries(chunks)) {
        fsx.writeJsonSync(`./hcoIds${key}`, chunk)
    }
    hcoVids
    




}