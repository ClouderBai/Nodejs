/* global __dirname */
const _ = require('lodash')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')
const moment = require('moment')
const xlsx = require('xlsx')


try {

  const arr = xls.parse(fs.readFileSync(path.resolve(__dirname, './data.csv')))
  const data = arr[0].data
  console.log(data);
  const headers = data.shift()
  console.log(headers);
  const __selectAction__ = []
  data.forEach(v => {
    const item = {}
    headers.forEach((key, index) => {
      item[key] = v[index]
    })
    __selectAction__.push(item)
  })
  console.log(__selectAction__);
  const selectAction = __selectAction__

  // ===============================================================================
    const mergeHcps =  selectAction
    const mergeProcess = [];
    const mergeResult = [];
    // 创建字典
    const vnEntityDic = {}
    const mergeHcpsDic = {};
    const HCPMAP = {};
    _.forEach(mergeHcps, hcp => {
      const arr = HCPMAP[`${hcp.hcpId}${hcp.mergedHcpId}`];
      vnEntityDic[`${hcp.vnEntityId}`] = hcp;
      mergeHcpsDic[`${hcp.mergedTo}`] = hcp;
      if(arr) arr.push(hcp)
      else HCPMAP[`${hcp.hcpId}${hcp.mergedHcpId}`] = [hcp]
    });

    const process = mergeHcps.slice()
    let curr = null;
    while(curr = process.shift()) {
      let previous
      // find previous till it's first one.
      do {
        previous = mergeHcpsDic[curr.vnEntityId]
        if(previous) curr = previous
      } while (previous);
      // find next one & push into fragment
      let next
      do {
        mergeProcess.push(curr)
        const index = process.indexOf(curr)
        if(index > -1) process.splice(index, 1)
        // find the same loser hcpid & winner hcpid
        let same = HCPMAP[`${curr.hcpId}${curr.mergedHcpId}`];
        if(same.length > 1) {
          same = same.filter(v => v !== curr)
          for (const it of same) {
            mergeProcess.push(it)
            const index = process.indexOf(it)
            if(index > -1) process.splice(index, 1)
          }
        }
        next = vnEntityDic[curr.mergedTo]
        if(next) curr = next
        // if it doesn't have next one. it means this is the last of winner. need to check TD & GK
        // else {
        //   if(curr.winnercycle && curr.winnercycle != moment(new Date(curr.mergedDate)).format('YYYYMM')) {
        //     const same = HCPMAP[`${curr.hcpId}${curr.mergedHcpId}`];
        //     for (const it of same) {
        //       it.winnerGK = it.winnerTier = ''
        //     }
        //   }
        // }
      } while (next);
    }

    // handle process result
    const process1 = mergeHcps.slice()
    // 1. unique process
    const grouped = _.uniqWith(process1, (arrVal, othVal) => arrVal.hcpId == othVal.hcpId && arrVal.mergedHcpId == othVal.mergedHcpId)
    const groupedCopy = grouped.slice()
    const groupHcpDic = {}
    const groupMergeDic = {}
    const groupSorted = []
    _.forEach(grouped, v => {
      groupHcpDic[`${v.vnEntityId}`] = v;
      groupMergeDic[`${v.mergedTo}`] = v;
    })
    // 2. sort group
    while(curr = groupedCopy.shift()) {
      let previous
      // find previous till it's first one.
      do {
        previous = groupMergeDic[curr.vnEntityId]
        if(previous) curr = previous
      } while (previous);
      // find next one & push into fragment
      let next
      do {
          groupSorted.push(curr)
          const index = groupedCopy.indexOf(curr)
          if(index > -1) groupedCopy.splice(index, 1)
          next = groupHcpDic[curr.mergedTo]
          if(next) curr = next
      } while (next);
    }
    // 3. get all process path.
    const pathArr = []
    groupSorted.reduce((pre, curr) => {
      if(pre.mergedHcpId == curr.hcpId) {
          if(pathArr[pathArr.length - 1]) {
              pathArr[pathArr.length - 1] += `,${curr.mergedHcpId}`
          } else {
              pathArr[pathArr.length - 1].push(`${pre.hcpId},${curr.hcpId},${curr.mergedHcpId}`)
          }
      } else {
          pathArr.push(`${curr.hcpId},${curr.mergedHcpId}`)
      }
      return curr
    }, {})


    const groupByMerge = _.groupBy(process1, v => `${v.mergedHcpId}`)
    const groupByHcpId1 = _.groupBy(process1, v => `${v.hcpId}`)
    // merge result
    for (const it of pathArr) {
        if(!it) return
        const path = it.split(',')
        if(it && path.length <= 2) {
          const pathArrTarget = groupByHcpId1[path[0]];
          if(pathArrTarget.length > 1) {
            const first = pathArrTarget
            const last = pathArrTarget
            const uniqueFirst = _.uniqWith(first, (a, b) => a.hcpId == b.hcpId && a.mergedHcpId == b.mergedHcpId && a.loserGK == b.loserGK)
            const uniqueLast = _.uniqWith(last, (a, b) => a.hcpId == b.hcpId && a.mergedHcpId == b.mergedHcpId && a.winnerGK == b.winnerGK)
            // [A1,A2,A3]  [B1,B2,B3]
            uniqueFirst.forEach(v => {
              const item = uniqueLast.find(v1 => (v.loserGK || null) == (v1.winnerGK || null))
              if(item) {
                mergeResult.push({
                    ...v,
                    mergedHcpId: item.mergedHcpId,
                    winnerFullName: item.winnerFullName,
                    winnerHcoId: item.winnerHcoId,
                    winnerHcoName: item.winnerHcoName,
                    winnerGK: item.winnerGK,
                    winnerTier: item.winnerTier,
                    winnercycle: item.winnercycle,
                    mergedDate: item.mergedDate
                })
                uniqueLast.splice(uniqueLast.indexOf(item), 1)
              } else {
                mergeResult.push({
                  ...v,
                  mergedHcpId: uniqueFirst[0]?.mergedHcpId,
                  winnerFullName: uniqueFirst[0]?.winnerFullName,
                  winnerHcoId: uniqueFirst[0]?.winnerHcoId,
                  winnerHcoName: uniqueFirst[0]?.winnerHcoName,
                  winnerGK: '',
                  winnerTier: '',
                  winnercycle: '',
                    // mergedDate: ''
                })
              }
            })
            if(uniqueLast.length > 0) {
              uniqueLast.forEach(v => {
                mergeResult.push({
                  ...v,
                  hcpId: uniqueFirst[0]?.hcpId || '',
                  loserFullName: uniqueFirst[0]?.loserFullName || '',
                  loserHcoId: uniqueFirst[0]?.loserHcoId || '',
                  loserHcoName: uniqueFirst[0]?.loserHcoName || '',
                  loserGK: '',// uniqueFirst[0].loserGK,
                  loserTier: '', // uniqueFirst[0].loserTier,
                  losercycle: '',
                })
              })
            }
          } else {
            mergeResult.push(...pathArrTarget)
          }
        }
        if(it && path.length > 2) {
            const hcpId = path[0]
            const first = groupByHcpId1[hcpId]
            const last = groupByMerge[path[path.length - 1]]
            const uniqueFirst = _.uniqWith(first, (a, b) => a.hcpId == b.hcpId && a.mergedHcpId == b.mergedHcpId && a.loserGK == b.loserGK)
            const uniqueLast = _.uniqWith(last, (a, b) => a.hcpId == b.hcpId && a.mergedHcpId == b.mergedHcpId && a.winnerGK == b.winnerGK)
            // [A1,A2,A3]  [B1,B2,B3]
            uniqueFirst.forEach(v => {
              const item = uniqueLast.find(v1 => (v.loserGK || null) == (v1.winnerGK || null))
              if(item) {
                mergeResult.push({
                    ...v,
                    mergedHcpId: item.mergedHcpId,
                    winnerFullName: item.winnerFullName,
                    winnerHcoId: item.winnerHcoId,
                    winnerHcoName: item.winnerHcoName,
                    winnerGK: item.winnerGK,
                    winnerTier: item.winnerTier,
                    winnercycle: item.winnercycle,
                    mergedDate: item.mergedDate
                })
                uniqueLast.splice(uniqueLast.indexOf(item), 1)
              } else {
                mergeResult.push({
                  ...v,
                  mergedHcpId: uniqueFirst[0]?.mergedHcpId,
                  winnerFullName: uniqueFirst[0]?.winnerFullName,
                  winnerHcoId: uniqueFirst[0]?.winnerHcoId,
                  winnerHcoName: uniqueFirst[0]?.winnerHcoName,
                  winnerGK: '',
                  winnerTier: '',
                  winnercycle: '',
                    // mergedDate: ''
                })
              }
            })
            if(uniqueLast.length > 0) {
              uniqueLast.forEach(v => {
                mergeResult.push({
                  ...v,
                  hcpId: uniqueFirst[0]?.hcpId || '',
                  loserFullName: uniqueFirst[0]?.loserFullName || '',
                  loserHcoId: uniqueFirst[0]?.loserHcoId || '',
                  loserHcoName: uniqueFirst[0]?.loserHcoName || '',
                  loserGK: '',// uniqueFirst[0].loserGK,
                  loserTier: '', // uniqueFirst[0].loserTier,
                  losercycle: '',
                })
              })
            }
        }
    }
    const header = [
      'Loser HCP ID',
      'Loser医生姓名',
      'Loser所在医院ID',
      'Loser所在医院名称',
      'Loser对应代表GK',
      'Loser医生Tier',
      'Loser TD Cycle',
      'Winner HCP ID',
      'Winner医生姓名',
      'Winner所在医院ID',
      'Winner所在医院名称',
      'Winner对应代表GK',
      'Winner医生Tier',
      'Winner TD Cycle',
      '更新时间',
    ];
    // merge process
    const mergeProcessXlsx = []
    let temporary = [];
    (mergeProcess.concat([{}])).reduce((pre, curr) => {
      if(pre.hcpId == curr.hcpId) {
        temporary.push(curr)
      } else {
        const temp = temporary.slice()
        temporary = [curr]
        if(temporary.length == 0) return curr
        const uniqueFirst = _.unionWith(temp, (v, v1) => v.hcpId == v1.hcpId && v.loserGK == v1.loserGK)
        const uniqueLast = _.unionWith(temp, (v, v1) => v.winnerHcoId == v1.winnerHcoId && v.winnerGK == v1.winnerGK)
        uniqueFirst.forEach(v => {
          const item = uniqueLast.find(v1 => !v.loserGK || !v1.winnerGK || (v.loserGK || null) == (v1.winnerGK || null))
          if(item) {
            mergeProcessXlsx.push({
                ...v,
                mergedHcpId: item.mergedHcpId,
                winnerFullName: item.winnerFullName,
                winnerHcoId: item.winnerHcoId,
                winnerHcoName: item.winnerHcoName,
                winnerGK: item.winnerGK,
                winnerTier: item.winnerTier,
                winnercycle: item.winnercycle,
                mergedDate: item.mergedDate
            })
            uniqueLast.splice(uniqueLast.indexOf(item), 1)
          } else {
            mergeProcessXlsx.push({
              ...v,
              mergedHcpId: uniqueFirst[0]?.mergedHcpId,
              winnerFullName: uniqueFirst[0]?.winnerFullName,
              winnerHcoId: uniqueFirst[0]?.winnerHcoId,
              winnerHcoName: uniqueFirst[0]?.winnerHcoName,
              winnerGK: '',
              winnerTier: '',
              winnercycle: '',
              mergedDate: uniqueFirst[0]?.mergedDate,
            })
          }
        })
        if(uniqueLast.length > 0) {
          uniqueLast.forEach(v => {
            mergeProcessXlsx.push({
              ...v,
              hcpId: uniqueFirst[0]?.hcpId || '',
              loserFullName: uniqueFirst[0]?.loserFullName || '',
              loserHcoId: uniqueFirst[0]?.loserHcoId || '',
              loserHcoName: uniqueFirst[0]?.loserHcoName || '',
              loserGK: '',
              loserTier: '',
              losercycle: '',
            })
          })
        }
      }
      return curr
    }, {})

    const mergeProcessXlsxData = _.map(mergeProcessXlsx, process => {
        const {
          hcpId,
          loserFullName,
          loserHcoId,
          loserHcoName,
          loserGK,
          loserTier,
          losercycle,
          
          mergedHcpId,
          winnerHcoId,
          winnerHcoName,
          winnerGK,
          winnerFullName,
          winnerTier,
          winnercycle,

          mergedDate,
        } = process;
        return [
          _.toString(hcpId),
          loserFullName,
          _.toString(loserHcoId),
          loserHcoName,
          loserGK,
          loserTier,
          losercycle,
          _.toString(mergedHcpId),
          winnerFullName,
          _.toString(winnerHcoId),
          winnerHcoName,
          winnerGK,
          winnerTier,
          winnercycle,
          moment(new Date(mergedDate)).format('YYYY年MM月DD日'),
        ];
    });
    const mergeResultXlsx = _.map(mergeResult, (process) => {
      const {
        hcpId,
        loserFullName,
        loserHcoId,
        loserHcoName,
        loserGK,
        loserTier,
        losercycle,
        
        mergedHcpId,
        winnerHcoId,
        winnerHcoName,
        winnerGK,
        winnerFullName,
        winnerTier,
        winnercycle,

        mergedDate,
      } = process;
      return [
        _.toString(hcpId),
        loserFullName,
        _.toString(loserHcoId),
        loserHcoName,
        loserGK,
        loserTier,
        losercycle,
        _.toString(mergedHcpId),
        winnerFullName,
        _.toString(winnerHcoId),
        winnerHcoName,
        winnerGK,
        winnerTier,
        winnercycle,
        moment(new Date(mergedDate)).format('YYYY年MM月DD日'),
      ];
  });
    // const filename = '医生合并关系管理';
    const mergeProcessWs = xlsx.utils.aoa_to_sheet(_.concat([header], mergeProcessXlsxData));
    const mergeResultWs = xlsx.utils.aoa_to_sheet(_.concat([header], mergeResultXlsx));
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, mergeProcessWs, '合并过程');
    xlsx.utils.book_append_sheet(wb, mergeResultWs, '合并结果');
    const buf = xlsx.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
    });


    fs.writeSync('./doctor_merge.csv', buf);




} catch (err) {
  console.log(err);
}