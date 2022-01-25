import { Expose, Transform, Exclude, plainToClass } from 'class-transformer'
import { MSrcHcoAddressModel } from './m-src-hco-address.model'
import moment from 'moment'
import { MSrcHcoParentModel } from './m-src-hco-parent.model'
import _ from 'lodash'


@Exclude()
export class MSrcHcoModel {
    @Expose({ name: 'lilly_hco_id__c' })
    @Transform((value) => (value ? Number(value.value.match(/CN-(\S*?)HCO/)[1]) : null))
    public hcoId: number;

    @Expose()
    public starHcoId: number;

    @Expose({ name: 'corporate_name__v' })
    public hcoName: string;

    @Expose({ name: 'pinyin_name__v' })
    public hcoEnglshName: string;

    @Expose({ name: 'alternate_name_1__v' })
    public hcoDesc: string;

    @Expose({ name: 'lilly_hco_id__c' })
    @Transform((value) => (value ? value.value.match(/CN-(\S*?)HCO/)[1] : null))
    public hcoCd: string;

    @Expose({ name: 'hco_type__v' })
    public hcoTypeCd: string;

    @Expose()
    public cntyName: string;

    @Expose()
    public cityName: string;

    @Expose({ name: 'phone_1__v' })
    public phone1: string;

    @Expose({ name: 'phone_2__v' })
    public phone2: string;

    @Expose()
    public adrsLine1: string;

    @Expose()
    public adrsLine2: string;

    @Expose({ name: 'URL_1__v' })
    public url: string;

    @Expose()
    public pstl: string;

    @Expose({ name: 'hco_status__v' })
    public hcoSttsCd: string;

    @Expose()
    public mergedToHcoId: number;

    @Expose()
    public mergedDate: number;

    @Expose({ name: 'master_vid__v' })
    public vnEntityId: string;

    @Expose()
    public adrsStatus: string;

    @Expose()
    public frmtAdrs: string;

    @Expose({ name: 'addresses__v' })
    public addresses: any[];

    @Expose({ name: 'count_beds__v' })
    public cntBed: number;

    @Expose({ name: 'count_licensed_drs__v' })
    public cntLcnsdAsstDctr: number;

    @Expose({ name: 'hco_sub_classification__c' })
    public subClsfctnCd: string;

    @Expose({ name: 'indstry_clsfctn_cd__c' })
    public clsfctnCd: string;

    @Expose({ name: 'created_date__v' })
    @Transform((value) => new Date(value.value), { toClassOnly: true })
    crtDt: Date;

    @Expose()
    @Transform(() => 'veeva')
    crtUser: string;

    @Expose({ name: 'modified_date__v' })
    @Transform((value) => (value ? moment(value.value).toDate() : null))
    updtDt: Date;

    @Expose()
    @Transform(() => 'veeva')
    updtUser: string;

    @Expose({ name: 'parent_hcos__v' })
    public parentHcos: any[];

    @Expose()
    public parentHcoVId: string;

    @Expose()
    public prvncCd: string;

    setAddress() {
        if (this.addresses && this.addresses.length > 0) {
            const address = _.find(this.addresses, (item: any) => {
                return item.is_veeva_master__v === true && item.record_state__v === 'VALID' &&
                (item.address_status__v === 'ACTV' || item.address_status__v === 'A');
            });
            if (address) {
                const msrcHcoAddressModel: InstanceType<typeof MSrcHcoAddressModel> = plainToClass(
                    MSrcHcoAddressModel,
                    address,
                );
                this.adrsLine1 = msrcHcoAddressModel.adrsLine1;
                this.cntyName = msrcHcoAddressModel.subAdministrativeArea;
                this.cityName = msrcHcoAddressModel.locality;
                this.adrsLine2 = msrcHcoAddressModel.adrsLine2;
                this.adrsStatus = msrcHcoAddressModel.addressStatus;
                this.frmtAdrs = msrcHcoAddressModel.formattedAddress;
                this.pstl = msrcHcoAddressModel.pstl;
                this.prvncCd = msrcHcoAddressModel.prvncCd;
            }
        }
    }

    setParentHco() {
        if (this.parentHcos && this.parentHcos.length > 0) {
            const parentHco = _.find(this.parentHcos, (item: any) => {
                return item.is_veeva_master__v === true && item.record_state__v === 'VALID' &&
                    (item.parent_hco_status__v === 'ACTV' || item.parent_hco_status__v === 'A');
            });
            if (parentHco) {
                const msrcHcoParentModel: InstanceType<typeof MSrcHcoParentModel> = plainToClass(
                    MSrcHcoParentModel,
                    parentHco,
                );
                this.parentHcoVId = msrcHcoParentModel.parentHcoVId;
            }
        }
    }
}
