import moment from 'moment';
import { of, EMPTY, Subject, Observable } from '../../node_modules/rxjs';
import { mapTo, map, tap, concatAll, mergeAll, pluck, zipAll, combineAll, reduce, 
    toArray, expand, switchMap, switchMapTo, concatMap, filter,takeWhile
} from 'rxjs/operators';
import _ from 'lodash';
import { DATA } from './data'


export async function main() {
    const { offsetDay } = { offsetDay: 10 }; // offset day
    const endDate = moment().utcOffset(8).startOf('day');
    const startDate = moment().utcOffset(8).startOf('day').subtract(offsetDay, 'day');
    const periods = []
    const index = startDate.clone()
    while (index.isBefore(endDate)) {
        periods.push({ startTimestamp: index.format('YYYY-MM-DD HH:mm:ss'), endTimestamp: index.add(1, 'day').format('YYYY-MM-DD HH:mm:ss') })
    }


    let version = 1;
    const limit = 100;


    const subscription$ = of(...periods)
        .pipe(
            map(period => Promise.resolve({ totalCount: 0/* Math.ceil(Math.random() * 1000) */, version: version++ })),
            tap(v => console.log(`tap0: `, v)),

            concatAll(),
            tap(v => console.log(`tap1: `, v)),

            toArray(),
            tap(v => console.log(`tap2: `, v)),

            // mapTo([]),
            tap(v => console.log(`tap3: `, v)),

            filter((v: any[]) => v.length > 0),
            tap(v => console.log(`tap4: `, v)),

            switchMap((v: any[]) => v.length === 0 ? EMPTY : of(v)),
            tap(v => console.log(`tap5: `, v)),


            map((v: VeevaParameters) => _.zipWith(v, periods, (v1, v2) => Object.assign(v1, v2))),
            tap(v => console.log(`tap6 : `, v)),
            
            switchMap((arr: any[]) => of(...arr)),
            tap(v => console.log(`tap7 : `, v)),

            map((v: VeevaParameters) => Object.assign(v, { pageCount: Math.ceil(v.totalCount / limit), pageSize: limit })),
            tap(v => console.log(`tap8 : `, v)),
            
            map((v: VeevaParameters) => Object.assign(v, { pageIndexArray: _.times(v.pageCount, v => v + 1) })),
            tap(v => console.log(`tap9 : `, v)),

            map((v: VeevaParameters) => {
                return v.pageIndexArray.length > 0 
                ? v.pageIndexArray.map(index => Object.assign({}, v, { pageIndex: index }))
                : [v]
            }),
            tap(v => console.log(`tap10 : `, v)),

            toArray(),
            tap(v => console.log(`tap11 : `, v)),

            map((v: VeevaParameters[][]) => v.flat()),
            tap((v: VeevaParameters) => console.log(`tap12 : `, v)),

            map(v => _.chunk(v, 5)),
            tap(v => console.log(`tap13 : `, v)),

            concatMap((v: any[]) => of(...v)),
            tap((v: VeevaParameters) => console.log(`tap14 : `, v)),
            
            map((vv: VeevaParameters[]) => vv.map(v => v.totalCount > 0 ?
                fetchHcoHcpByHttp({
                    startTimestamp: v.startTimestamp,
                    endTimestamp: v.endTimestamp,
                    offset: (v.pageIndex - 1) * v.pageSize,
                    limit: v.pageSize,
                    type: 'VEEVA_TYPE.HCO'
                }) : Promise.resolve(v)
            )),
            tap(v => console.log(`tap15 : `, v)),

            concatMap(async (vv: Promise<VeevaParameters>[]) => await Promise.all(vv)),
            tap(v => console.log(`tap16 : `, v)),

            concatAll(),
            tap(v => console.log(`tap17 : `, v)),

            toArray(),
            tap(v => console.log(`tap18 : `, v)),            
        )


    // const result = await subscription$.toPromise()
    // return result
    

    const result = await of({ totalCount: ~~(Math.random() * 0) } as any).pipe(
        tap((v: VeevaMergeResponse) => (v.events = [])),
        tap((v: VeevaMergeResponse) => Logger.log(`Merged data count: ${JSON.stringify(v)}`)),
        tap((v: VeevaMergeResponse) => (v.pageIndexArray = _.times(Math.ceil(v.totalCount / 100), v1 => v1 + 1))),
        map((v: VeevaMergeResponse) => v.totalCount > 0
            ? v.pageIndexArray.map(index => Object.assign({}, v, { pageIndex: index }))
            : [v]
        ),
        switchMap(v => of(...v)),
        tap(v => Logger.log(`Merged data pages count: ${JSON.stringify(v)}`)),
        concatMap(async v => v.totalCount > 0
            ? {...v, version: 'https'}
            : v
        ),
        toArray<any>(),
        map((v: VeevaMergeResponse[][]) => (v as any).flat()),
    ).toPromise()

    result



    const result1 = await of(...DATA)
    .pipe(
        tap(v => Logger.log(`VeevaResponse.totalCount: ${v.totalCount}`)),
        pluck('entities'),
        tap(v => console.log('tap 0: ', v.length)),

        map(v => v.map(v1 => v1.entity)),
        tap(v => console.log('tap 1: ', v.length)),

        concatAll(),
        
        toArray(),
        tap(v => console.log('tap 2: ', v)),
        // tap(v => console.log('tap 3: ', v)),
        // map((v) => _.chunk(v, 100)),
        // concatMap(vv => of(...vv)),
        // map(async(vv: string[]) => await (vv))
    ).toPromise()
    

    result1



}



let version = 1;
function fetchHcoHcpByHttp(params: { startTimestamp;endTimestamp;offset;limit; type; }) {
    return Promise.resolve({
        version: version++
    })

}


class Logger {
    static log(v) {
        console.log(v)
    }
}


enum VEEVA_TYPE {
    HCO = 'HCO',
    HCP = 'HCP',
    MERGE = 'MERGE',
}

interface HttpResult extends VeevaResponse {
    startTimestamp: string;
    endTimestamp: string;
    offset: number;
    limit: number;
    type: VEEVA_TYPE;
    url: string;
}

interface VeevaParameters {
    startTimestamp: string; // start timestamp
    endTimestamp: string; // end timestamp
    pageCount: number; // pagecount
    pageSize: number; // page size
    pageIndex: number; // page index
    pageIndexArray: number[]; // page index array
    totalCount: number;
}


interface VeevaResponse {
    responseStatus: string;
    entities: VeevaEntity[];
    totalCount: number;
    offset: number;
    limit: number;
    supplementalResults: Record<any, any>[];
}

interface VeevaEntity {
    entityId: string;
    entityType: VEEVA_TYPE;
    metaData: Record<string, any>;
    entity: Record<string, any>;
}


// veeva merge
interface VeevaMergeResponse extends VeevaParameters {
    errors: any;
    responseStatus: string;
    totalCount: number;
    offset: number;
    limit: number;
    sinceDate: string;
    events: VeevaMergeEntity[];
    url: string;
}


interface VeevaMergeEntity {
    type: MergeEnums,
    date: string;
    entities: VeevaMergeProperty[]
}

interface VeevaMergeProperty {
    type: string;
    entityId: string;
    entityType: string; // VALID, DELETED,UNDER_REVIEW, MERGED_INTO, MERGE_INACTIVATED, MERGE_ADDED,INVALID
}
