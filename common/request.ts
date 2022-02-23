import axios from 'axios'

const request = axios.create({
    baseURL: `https://lillycn.veevanetwork.com`, // prd
    // baseURL: `https://sandbox.veevanetwork.com`, // qa
    timeout: 6e3,
    headers: {
        // 'Authorization': process.env.VEEVA_SESSION
        'Authorization': 'A82F102229ECA72C36C75943F6593EFBFBE9F728F9FAD5C55E66D880E1F2A03F20C210B1AE990609D689D6B2ACAEA64D11C8F3DB1BBCC99A65211314B1B8CD24C509F819056A4661CE565CCA69339E14'
    }
});


// Add a request interceptor
request.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
request.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if(response.status === 200) return response.data;
    return response
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});


export {
    request
}