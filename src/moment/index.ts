import moment from "moment";
import _ from 'lodash'

export function main() {


    const termination_date = ''
    const no = _.toNumber(termination_date);
    const reslut = !!termination_date && _.toNumber(termination_date) <= _.toNumber(moment().utc().add(8, 'h').format('YYYYMMDD'))
    console.log('----------reslut-------------', reslut)
    // const expired = moment().add(55, 'minutes')
    const r1 = moment(termination_date).utc().format('YYYYMMDD')
    const r3 = _.toNumber(moment(termination_date).utc().format('YYYYMMDD'))
    const r5 = _.toNumber(moment().utc().format('YYYYMMDD'));
    const r2 = !!termination_date && _.toNumber(moment(termination_date).utc().format('YYYYMMDD')) <= _.toNumber(moment().utc().format('YYYYMMDD'))
    const r4 = NaN <= r5;
    // const result = expired.isAfter(moment())
    // console.log('----------result-------------', result)

    const d = new Date()
    const end = moment().add(11, 'seconds')
    console.log('----------end.formNow()-------------', end.diff(moment(), 'seconds'))

    var time= moment.utc(3661000).format('Elapsed Time: {HH} hours: mm minutes: ss seconds');
    console.log(time) // 01:01:01


}


main()