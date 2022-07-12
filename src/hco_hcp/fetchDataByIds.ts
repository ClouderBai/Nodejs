import { URL } from 'url'
import { request } from '../../common/request';
import _ from 'lodash';
import { DataSource } from './dataSource';

// const hcpUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&sort=master_vid__v&includeMasterResults=false'
// const hcoUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCO&sort=modified_date__v&sortOrder=asc&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&includeMasterResults=false'
const HCO_URL = 'https://lillycn.veevanetwork.com/api/v16.0/hcos/Network:Entity:'
const HCP_URL = 'https://lillycn.veevanetwork.com/api/v16.0/hcps/Network:Entity:'

const TYPE = 'HCO'  // HCO HCP
const VEEVA_HCO_ID = [
    "347525139677680641",
    "347525178458215424",
    "347525142999569409",
    "347525207231140865",
    "347525152050877441",
    "347525140575261696",
    "347525140139054081",
    "347525152889738241",
    "347525143100232704",
    "347525135483376640",
    "347525144450798592",
    "347525144383689729",
    "347525156983378944",
    "347525140600427520",
    "785983871207445514",
    "347524550268916736",
    "347525216399889408",
    "347525192752403457",
    "347530313200669696",
    "934435487810915128",
    "347530895772718090",
    "938573019869678367",
    "411298252307141647",
    "347525429378257920",
    "937837372157594399",
    "347525143452554240",
    "347530075199083536",
    "347525154793952257",
    "347524549723657216",
    "347525134694847488",
    "933754163034327839",
    "347525411476968449",
    "347525737693156352",
    "347525157855794176",
    "930844889486196767",
    "347525175060829184",
    "347525141196018688"
]

const VEEVA_HCP_ID = [
    
]



export const fetchDataByIds = async () => {
    let _URI;
    let _TYPE = TYPE;
    if(TYPE == 'HCO') {
        _URI = HCO_URL
    }
    
    const datasource = new DataSource()
    datasource.addVersion()

    for (const veevaId of VEEVA_HCO_ID) {
        const reponse = await request({
            url: _URI + veevaId,
            method: 'GET',
        })
        if(reponse.responseStatus !== 'SUCCESS') throw new Error('HCO_ID not exits')
        const { entities } = (reponse || {})
        const entitiy = entities && entities.length > 0 && entities[0] || {}

        await datasource.saveMetadata({ data: reponse, type: _TYPE, url: _URI + veevaId, offset: `0`})
    }

    console.log('----------res-------------', )
}