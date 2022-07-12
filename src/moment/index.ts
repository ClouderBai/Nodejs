import moment from "moment";


export function main() {


    const expired = moment().add(55, 'minutes')
    const result = expired.isAfter(moment())

    console.log('----------result-------------', result)


}