import { URL } from 'url'
import { request } from '../../common/request';
import _ from 'lodash';
import { DataSource } from './dataSource';

// const hcpUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&sort=master_vid__v&includeMasterResults=false'
// const hcoUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCO&sort=modified_date__v&sortOrder=asc&filters=range||modified_date__v:1644944400000||1645117200000~primary_country__v:CN~record_state__v:VALID&includeMasterResults=false'
const hcpUrl = 'https://lillycn.veevanetwork.com/api/v16.0/search?q=*&offset=0&limit=100&types=HCP&filters=lilly_hcp_id__c:CN-300449503HCP'

const type = 'HCP'


export const fetchDataByUrl = async () => {
    const _uri = hcpUrl;
    const _type = type
    
    const datasource = new DataSource()
    datasource.addVersion()

    const uriObject =new URL(_uri);
    uriObject.searchParams.delete('limit')
    uriObject.searchParams.delete('offset')
    uriObject.searchParams.append('limit', '0')
    uriObject.searchParams.append('offset', '0')
    const totalCountResponse = await request({
        url: uriObject.pathname + uriObject.search,
        method: 'GET',
    })

    const { totalCount } = (totalCountResponse || {});
    const pageSize = Math.ceil(totalCount/100)
    const pageIndexArray = _.times(pageSize, v => v + 1);
    

    
    for (const pageIndex of pageIndexArray) {
        console.log('----------limit,offset, -------------', 100, (pageIndex - 1) * 100)
        const uriObject = new URL(_uri);
        uriObject.searchParams.delete('offset')
        uriObject.searchParams.append('offset', `${(pageIndex - 1) * 100}`)
        const chunk = await request({
            url: uriObject.pathname + uriObject.search,
            method: 'GET',
        })

        await datasource.saveMetadata({ data: chunk, type: _type, url: uriObject.toString(), offset: `${(pageIndex - 1) * 100}`})
    }

    console.log('----------res-------------', totalCountResponse)
}