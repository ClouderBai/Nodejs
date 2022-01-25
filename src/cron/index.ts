import cron from 'cron'
import moment from 'moment';





export async function main() {
    const job = new cron.CronJob('0 0/15 * * * *')
    console.log('----------job.nextDate()-------------', job.nextDate().format('YYYY-MM-DD HH:mm:ss'));
    const is5 = job.nextDate().diff(moment(), 'minutes');
    console.log('----------is5-------------', is5)

    console.log('-----------------------', {
        aaa: moment().format('YYYY-MM-DD HH:mm:ss'),
                    startDate: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                    endDate: moment().subtract((1 - 1), 'days').format('YYYY-MM-DD HH:mm:ss'),
                })
}