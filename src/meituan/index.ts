
import { createCipheriv, createDecipheriv } from 'crypto'
import axios from 'axios';
import Qs from 'qs';
import _ from 'lodash';
var SqtAESUtil: any = {};
SqtAESUtil.MyConstanst = {
    ENCODING: 'utf8',
    BASE64: 'base64',
    MODE: 'aes-128-ecb',
    IV: Buffer.from(''),
    BUFFER: 'buffer',
    SECRETKEY: '8T5ke48ru8og8OHqDUqtYg=='
};
SqtAESUtil.aesEncrypt = function (plainText) {
    var secretkey = Buffer.from(SqtAESUtil.MyConstanst.SECRETKEY, SqtAESUtil.MyConstanst.BASE64);

    var cipherChunks = [];
    var cipher = createCipheriv(SqtAESUtil.MyConstanst.MODE, secretkey, SqtAESUtil.MyConstanst.IV);
    cipher.setAutoPadding(true);

    cipherChunks.push(cipher.update(Buffer.from(plainText, SqtAESUtil.MyConstanst.ENCODING), SqtAESUtil.MyConstanst.BUFFER, SqtAESUtil.MyConstanst.BASE64));
    cipherChunks.push(cipher.final(SqtAESUtil.MyConstanst.BASE64));

    return cipherChunks.join('');
}
SqtAESUtil.aesDecrypt = function (encryptText) {
    var secretkey = Buffer.from(SqtAESUtil.MyConstanst.SECRETKEY, SqtAESUtil.MyConstanst.BASE64);

    var cipherChunks = [];
    var decipher = createDecipheriv(SqtAESUtil.MyConstanst.MODE, secretkey, SqtAESUtil.MyConstanst.IV);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(encryptText, SqtAESUtil.MyConstanst.BASE64, SqtAESUtil.MyConstanst.ENCODING));
    cipherChunks.push(decipher.final(SqtAESUtil.MyConstanst.ENCODING));

    return cipherChunks.join('');
}
const base_url = 'https://bep-openapi.meituan.com/api/sqt/openapi'

async function request(uri, params) {
    const res =  await axios.request({
        url: `${base_url}${uri}`,
        method: 'POST',
        data: Qs.stringify({
            token: 'BJBLXIT055OI-TK',
            content: SqtAESUtil.aesEncrypt(JSON.stringify({
                ts: ~~(+new Date() / 1000),
                entId: 47775,
                ...params
            })),
            version:'1.0'
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        proxy: false
    })
    return res.data
}

async function staffBatchQuery() {
    const data = await request(`/staff/batch/query`, {
        method: 'staff.batch.query',
        staffIdType: 30,
        staffIdentifiers: ['L027366Testing']
    })
    return data
}
async function staffBatchQuery1() {
    const data = await request(`/tag/group/query`, {
        method: 'tag.group.query',
        pageNo: 1,
        pageSize: 20
    })
    return data
}
async function staffBatchQuery2() {
    const data = await request(`/tag/query`, {
        method: 'tag.query',
        tagGroupId: 40905,
        pageNo: 1,
        pageSize: 20
    })
    return data
}


// const key = CryptoJS.enc.Base64.parse("秘钥");  //这里使用base64 或者 utf8 要看要求，加解密一致即可
// const iv = CryptoJS.enc.Utf8.parse('偏移量');   //十六位十六进制数作为密钥偏移量
// function Encrypt(word) {
//      let srcs = CryptoJS.enc.Utf8.parse(word);
//      let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//      return encrypted.toString();
//  }
// function Decrypt(word) {
//      let decrypt = CryptoJS.AES.decrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//      let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
//      return decryptedStr.toString();
//  }
// function Encrypt(word) {
//      let srcs = CryptoJS.enc.Utf8.parse(word);
//      let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//      return encrypted.ciphertext.toString();
//  }
// function Decrypt(word) {
//      let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
//      let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
//      let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//      let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
//      return decryptedStr.toString();
//  }
export async function main() {


    const list = [
        { name: '1', code: '1', },
        { name: '2', code: '2', },
        { name: '3', code: '3', },
        { name: '4', code: '4', },
    ]

    const result = _.find(list, { name: '3', code: ''})


    console.log('----------result-------------', result)



    const obj = {
        ID: "3",
        EMPLOYEE_GLOBAL_ID: "2004242Testing",
        EMPLOYEE_ACCOUNT: "WF87186Testing",
        STATUS: 0,
        DPRTMNT: "Commercial",
        BU: "Commercial",
        SALES_REGION: "",
        USER_ROLE: null,
        EMPLOYEE_NAME: "蓝雁",
        EMPLOYEE_EMAIL: "TestingLAN_YAN@LILLY.COM",
        EMPLOYEE_CITY: "Cheng Du-成都",
        COST_CENTER: "0004357506",
        SUPERVISOR1_ROLE: "Sr. Manager-District Commercial",
        SUPERVISOR1_NAME: "王飞",
        SUPERVISOR1_ACCOUNT: "C118360Testing",
        SUPERVISOR1_EMAIL: "WANG_FEI_TELLER@LILLY.COMTesting",
      }

    Object.keys(obj).forEach(key => {
        if(obj[key] === undefined || obj[key] === '') obj[key] = null;
    })

    obj
    // let message = 'LXFAZF5PYT/pc9EGyFw/H3DTTeQ3J4nb7mazUulZcX24ekE1/ZOT8cDw8/z++55tKWP3a3zsvtrd2kilBtrXwA=='
    // const result = SqtAESUtil.aesDecrypt(message)
    // console.log('----------result-------------', result)





    


    // console.log('----------data-------------', data)
}
