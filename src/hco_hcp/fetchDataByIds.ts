import { URL } from 'url'
import { request } from '../../common/request';
import _ from 'lodash';
import { DataSource } from './dataSource';

// const hcpUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&sort=master_vid__v&includeMasterResults=false'
// const hcoUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCO&sort=modified_date__v&sortOrder=asc&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&includeMasterResults=false'
// const HCO_URL = 'https://lillycn.veevanetwork.com/api/v16.0/hcos/Network:Entity:{VEEVA_ENTITY_ID}'
// const HCP_URL = 'https://lillycn.veevanetwork.com/api/v16.0/hcps/Network:Entity:{VEEVA_ENTITY_ID}'
const HCP_URL_BY_HCPID = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=lilly_hcp_id__c:CN-{HCP_ID}HCP'

export const fetchDataByIds = async () => {
    const ids = [
        '938154108180564781', '929960529211162664'
    ];
    await fetchByVeevaId(ids)
    // await fetchByHcpId(ids)


}




const fetchByVeevaId = async (ids) => {
    const _URI = 'https://lillycn.veevanetwork.com/api/v16.0/hcps/Network:Entity:'
    const _TYPE = 'HCP';
    // const _URI = 'https://lillycn.veevanetwork.com/api/v16.0/hcos/Network:Entity:'
    // const _TYPE = 'HCO';

    const datasource = new DataSource()
    datasource.addVersion()

    for (const veevaId of ids) {
        const reponse = await request({
            url: _URI + veevaId,
            method: 'GET',
        })
        if(reponse.responseStatus !== 'SUCCESS') throw new Error('HCO_ID not exits')
        const { entities } = (reponse || {})
        const entitiy = entities && entities.length > 0 && entities[0] || {}

        await datasource.saveMetadata({ data: reponse, type: _TYPE, url: _URI + veevaId, offset: `0`})
    }
    console.log('----------done-------------')
}


const fetchByHcpId = async (ids) => {
    const _URI = '/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=lilly_hcp_id__c:CN-{HCP_ID}HCP'

    const datasource = new DataSource()
    datasource.addVersion()

    for (const hcpId of ids) {
        const url = _URI.replace(`{HCP_ID}`, hcpId)
        const reponse = await request({
            url,
            method: 'GET',
        })
        if(reponse.responseStatus !== 'SUCCESS') throw new Error('HCO_ID not exits')
        const { entities } = (reponse || {})
        const entitiy = entities && entities.length > 0 && entities[0] || {}

        await datasource.saveMetadata({ data: reponse, type: 'HCP', url, offset: `0`})
    }
    console.log('----------done-------------')
}