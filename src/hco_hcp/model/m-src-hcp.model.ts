import { Expose, Transform, Exclude, plainToClass } from 'class-transformer';
import moment from 'moment';
import { MSrcHcpLicensesModel } from './m-src-hcp-licenses.model';
import _ from 'lodash';

@Exclude()
export class MSrcHcpModel {
    @Expose({ name: 'master_vid__v' })
    vnEntityId: string;

    @Expose({ name: 'lilly_hcp_id__c' })
    @Transform((value) => (value ? Number(value.match(/CN-(\S*?)HCP/)[1]) : null))
    hcpId: string;

    @Expose({ name: 'first_name__v' })
    givenName: string;

    @Expose({ name: 'last_name__v' })
    fmlyName: string;

    @Expose({ name: 'pinyin_name__v' })
    aliasName;

    @Expose({ name: 'gender__v' })
    gender: string;

    @Expose({ name: 'hcp_classification__c' })
    clssfctnCd: string;

    @Expose({ name: 'hcp_sub_classification__c' })
    subClssFctnCd: string;

    @Expose({ name: 'academic_title__v' })
    acadCd: string;

    @Expose({ name: 'professional_title__v' })
    profCd: string;

    @Expose({ name: 'created_date__v' })
    @Transform((value) => new Date(value), { toClassOnly: true })
    crtDt: Date;

    @Expose()
    @Transform(() => 'veeva')
    crtUser: string;

    @Expose({ name: 'modified_date__v' })
    @Transform((value) => (value ? moment(value).toDate() : null))
    updtDt: Date;

    @Expose()
    @Transform(() => 'veeva')
    updtUser: string;

    @Expose({ name: 'hcp_status__v' })
    hcpSttsCd: string;

    @Expose({ name: 'hcp_type__v' })
    hcpTypCd: string;

    @Expose({ name: 'specialty_1__v' })
    spcltyCd: string;

    @Expose({ name: 'parent_hcos__v' })
    public parentHcos: any[];

    @Expose({ name: 'primary_department_class__v' })
    prmryDprtmntCd: string;

    @Expose({ name: 'licenses__v' })
    public licenses: any[];

    @Expose()
    licenseCd: string;

    @Expose({ name: 'record_state__v' })
    rcrdStateCd: string;

    setLicenses() {
        if (this.licenses && this.licenses.length > 0) {
            const license = _.find(this.licenses, (item: any) => {
                return item.is_veeva_master__v === true &&
                    item.record_state__v === 'VALID' &&
                    item.entity_type__v === 'HCP' &&
                    (item.license_status__v === 'ACTV' || item.license_status__v === 'A');
            });
            if (license) {
                const srcHcpLicensesModel: MSrcHcpLicensesModel = plainToClass(
                    MSrcHcpLicensesModel,
                    license,
                );
                this.licenseCd = srcHcpLicensesModel.licenseCd;
            }
        }
    }
}
