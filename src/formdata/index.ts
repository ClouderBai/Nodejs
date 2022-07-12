import axios from 'axios';
import Qs from 'qs';



export async function main() {

    try {
        const response = await axios.request({
            url: 'https://login.chinacloudapi.cn/eda1781b-14c5-47c4-aba3-766a6f3a50fd/oauth2/v2.0/token',
            method: 'POST',
            data: Qs.stringify({
                client_id: '2025f654-3125-4545-a75c-9ac1125ac11c',
                client_secret: '6G-1rX8~Vws~nak9m1EBok-n~5PV0GUVmO',
                grant_type: `client_credentials`,
                scope: `api://2025f654-3125-4545-a75c-9ac1125ac11c/.default`
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })

        console.log('----------response-------------', response)
    } catch (err) {
        console.log('----------err-------------', err)
    }










}