/* global __dirname process */
// require the file system module
// const fs = require('fs');
// const zlib = require('zlib');
// const { Transform, PassThrough } = require('stream');
const moment = require('moment');

const { startDate, endDate: endParameter } = { startDate: new Date('2021/07/01 08:00:00'), endDate: new Date('2021/09/15  08:00:00') };
const currMonth = moment(startDate).utc()
const endDate = moment(endParameter).utc()
const range = []

while(currMonth.isBefore(endDate, 'days') && currMonth.clone().endOf('months').isBefore(endDate, 'days')) {
  const endMonth = moment(currMonth).utc().endOf('months')
  range.push([currMonth.clone().toDate(), endMonth.clone().toDate()])
  currMonth.add(1, 'months')
}
range.push([moment(currMonth).clone().toDate(), moment(endDate).clone().toDate()])
// range.forEach(([v1, v2]) => console.log(moment(v1).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(v2).format('YYYY-MM-DD HH:mm:ss')))
range.forEach(([v1, v2]) => console.log(v1, v2))





/*
    Create readable stream to file in current directory named 'node.txt'
    Use utf8 encoding 
    Read the data in 16-kilobyte chunks
*/
// const readable = fs.createReadStream(__dirname + '/test1.csv', { encoding: 'utf8', highWaterMark: 16 * 1024 });

// create writable stream
// const writable = fs.createWriteStream(__dirname + '/nodePipe.gz');


// const reportProgress = new Transform({
//   transform(chunk, encoding, callback) {
//     // process.stdout.write('.');
//     console.log('.')
//     callback(null, chunk);
//   }
// });
// use pipe to copy readable to writable
// readable
//     .pipe(zlib.createGzip())
//     .pipe(reportProgress)
//     .pipe(writable)
//     .on('finish', () => console.log('Done'));


// const passThrough = new PassThrough();
// process.stdin.pipe(passThrough).pipe(process.stdout);


// passThrough.on('error', err => {
//     console.error('passThrough encountered an error:', err);
//   });
//   process.stdin.on('error', err => {
//     console.error('stdin encountered an error:', err);
//   });
//   process.stdout.on('error', err => {
//     console.error('stdout encountered an error:', err);
//   });
  
//   process.stdin.pipe(passThrough).pipe(process.stdout);
  
//   passThrough.emit('error', new Error('Somewthing went wrong!'));