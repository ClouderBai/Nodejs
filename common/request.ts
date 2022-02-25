import axios from 'axios'

const request = axios.create({
    baseURL: `https://lillycn.veevanetwork.com`, // prd
    // baseURL: `https://sandbox.veevanetwork.com`, // qa
    timeout: 6e3,
});


// Add a request interceptor
request.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers.Authorization = process.env.VEEVA_SESSION
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