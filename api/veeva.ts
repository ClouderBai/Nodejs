import { request } from '../common/request'


export const fetchSessionId = () => {
    const { VEEVA_USERNAME, VEEVA_PASSWORD } = process.env;
    return request({
        url: `/api/v16.0/auth?username=${VEEVA_USERNAME}&password=${VEEVA_PASSWORD}`,
        method: 'POST',
    })
}

export const fetchHcoByEntityId = (entityId) => {
    return request({
        url: `/api/v16.0/hcos/Network:Entity:${entityId}`,
        method: 'GET',
    })
}

export const fetchHcpByEntityId = (entityId) => {
    return request({
        url: `/api/v16.0/hcps/Network:Entity:${entityId}`,
        method: 'GET',
    })
}

export const fetchHcoByHcoId = (hcoid) => {
    return request({
        url: `/api/v16.0/search?q=*&offset=0&limit=10&types=HCO&filters=lilly_hco_id__c:CN-${hcpid}HCO`,
        method: 'GET',
    })
}

export const fetchHcpByHcpId = (hcpid) => {
    return request({
        url: `/api/v16.0/search?q=*&offset=0&limit=10&types=HCP&filters=lilly_hcp_id__c:CN-${hcpid}HCP`,
        method: 'GET',
    })
}



