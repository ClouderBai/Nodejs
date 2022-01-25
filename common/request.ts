import axios from 'axios'

const request = axios.create({
    baseURL: `https://lillycn.veevanetwork.com`, // prd
    // baseURL: `https://sandbox.veevanetwork.com`, // qa
    timeout: 6e3,
    headers: {
        // 'Authorization': process.env.VEEVA_SESSION
        'Authorization': 'FF0ECEB0E784AB5B34B2F23CE5E52BED897E40E32E91856825EB2124C58C74C660BCCEEEFA38913A4BDC3BC5F20863C3F039322F5F89860C4500EB31F78C8D18D6FD519BD660B647E32427CE93EEFED7'
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