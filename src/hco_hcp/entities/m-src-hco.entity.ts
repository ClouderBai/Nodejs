import { MSrcHcoModel } from "../model";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";


@Entity({ schema: 'cmd_owner', name: 'm_src_hco' })
export class MSrcHcoEntity extends BaseEntity {
    
    @Column({ name: 'hco_id' })
    public hcoId: number;

    @Column('varchar', { name: 'hco_name', length: 1000, nullable: true })
    public hcoName: string;

    @Column('varchar', { name: 'hco_englsh_name', length: 2000, nullable: true })
    public hcoEnglshName: string;

    @Column('varchar', { name: 'hco_desc', length: 4000, nullable: true })
    public hcoDesc: string;

    @Column('varchar', { name: 'hco_cd', length: 80, nullable: true })
    public hcoCd: string;

    @Column('varchar', { name: 'hco_type_cd', length: 80, nullable: true })
    public hcoTypeCd: string;

    @Column('varchar', { name: 'cnty_name', length: 40, nullable: true })
    public cntyName: string;

    @Column('varchar', { name: 'city_name', length: 40, nullable: true })
    public cityName: string;

    @Column('varchar', { name: 'phone_1', length: 200, nullable: true })
    public phone1: string;

    @Column('varchar', { name: 'phone_2', length: 200, nullable: true })
    public phone2: string;

    @Column('varchar', { name: 'adrs_line_1', length: 1000, nullable: true })
    public adrsLine1: string;

    @Column('varchar', { name: 'adrs_line_2', length: 1000, nullable: true })
    public adrsLine2: string;

    @Column('varchar', { name: 'url', length: 2000, nullable: true })
    public url: string;

    @Column('varchar', { name: 'pstl', length: 400, nullable: true })
    public pstl: string;

    @Column({ name: 'hco_stts_cd', nullable: true })
    public hcoSttsCd: string;

    @Column('varchar', { name: 'vn_entity_id', length: 80, nullable: true })
    public vnEntityId: string;

    @Column('varchar', { name: 'adrs_status', length: 80, nullable: true })
    public adrsStatus: string;

    @Column('varchar', { name: 'frmt_adrs', length: 1000, nullable: true })
    public frmtAdrs: string;

    @Column('varchar', { name: 'afltn_role', length: 80, nullable: true })
    public afltnRole: string;

    @Column('varchar', { name: 'sub_clsfctn_cd', length: 80, nullable: true })
    public subClsfctnCd: string;

    @Column('varchar', { name: 'sub_clsfctn_name', length: 100, nullable: true })
    public subClsfctnName: string;

    @Column('varchar', { name: 'clsfctn_cd', length: 80, nullable: true })
    public clsfctnCd: string;

    @Column('varchar', { name: 'clsfctn_name', length: 100, nullable: true })
    public clsfctnName: string;

    @Column({ name: 'cnt_bed', nullable: true })
    public cntBed: number;

    @Column({ name: 'cnt_lcnsd_asst_dctr', nullable: true })
    public cntLcnsdAsstDctr: number;

    @Column('varchar', { name: 'merged_to', length: 200, nullable: true })
    public mergedTo: string;

    @Column({ type: 'timestamp', name: 'merged_date', nullable: true })
    public mergedDate: Date;

    @Column('varchar', { name: 'crt_user', length: 80, nullable: true })
    public crtUser: string;

    @Column({ type: 'timestamp', name: 'crt_dt' })
    public crtDt: Date;

    @Column('varchar', { name: 'updt_user', length: 80, nullable: true })
    public updtUser: string;

    @Column({ type: 'timestamp', name: 'updt_dt' })
    public updtDt: Date;

    @Column('varchar', { name: 'rcrd_state_cd', length: 80, nullable: true })
    public rcrdStateCd: string;

    @Column('varchar', { name: 'parent_hco_v_id', length: 80, nullable: true })
    public parentHcoVId: string;

    @Column('varchar', { name: 'prvnc_cd', length: 40, nullable: true })
    public prvncCd: string;

    constructor(msrcHcoModel: MSrcHcoModel) {
        super();
        Object.assign(this, msrcHcoModel);
    }
}
