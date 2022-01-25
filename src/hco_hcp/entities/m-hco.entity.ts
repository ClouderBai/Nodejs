import { Column, Entity, OneToMany, PrimaryColumn, VersionColumn } from 'typeorm';
import { MRefHcpHcoEntity } from './m-ref-hcp-hco.entity';

@Entity({ schema: 'cmd_owner', name: 'm_hco' })
export class MHcoEntity {
    @PrimaryColumn({ name: 'hco_id' })
    public hcoId: number;

    @Column({ name: 'star_hco_id', nullable: true })
    public starHcoId: number;

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

    @Column('varchar', { name: 'hco_type_name', length: 100, nullable: true })
    public hcoTypeName: string;

    @Column('varchar', { name: 'cnty_cd', length: 80, nullable: true })
    public cntyCd: string;

    @Column('varchar', { name: 'cnty_name', length: 100, nullable: true })
    public cntyName: string;

    @Column('varchar', { name: 'city_cd', length: 80, nullable: true })
    public cityCd: string;

    @Column('varchar', { name: 'city_name', length: 100, nullable: true })
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

    @Column({ name: 'stts_ind', nullable: true })
    public sttsInd: number;

    @Column('varchar', { name: 'hco_stts_cd', nullable: true })
    public hcoSttsCd: string;

    @Column('varchar', { name: 'hco_stts_name', nullable: true })
    public hcoSttsName: string;

    @Column('varchar', { name: 'merged_to', length: 200, nullable: true })
    public mergedTo: string;

    @Column({ name: 'merged_date', nullable: true })
    public mergedDate?: Date;

    @Column('varchar', { name: 'vn_entity_id', length: 80, nullable: true })
    public vnEntityId: string;

    @Column('varchar', { name: 'adrs_status', length: 80, nullable: true })
    public adrsStatus: string;

    @Column('varchar', { name: 'frmt_adrs', length: 1000, nullable: true })
    public frmtAdrs: string;

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

    @Column('varchar', { name: 'parent_hco_v_id', length: 80, nullable: true })
    public parentHcoVId: string;

    @Column({ name: 'createduser', nullable: true })
    public createdUser?: string;

    @Column({ name: 'createddate', nullable: true })
    public createdDate?: Date;

    @Column({ name: 'modifieduser', nullable: true })
    public modifiedUser?: string;

    @Column({ name: 'modifieddate', nullable: true })
    public modifiedDate?: Date;

    @Column({ name: 'isdeleted', default: false })
    public isDeleted?: boolean;

    @VersionColumn({ name: 'versionnumber', nullable: true })
    public versionNumber?: number;

    @Column('varchar', { name: 'rcrd_state_cd', length: 80, nullable: true })
    public rcrdStateCd: string;

    @Column('varchar', { name: 'rcrd_state_name', length: 100, nullable: true })
    public rcrdStateName: string;

    @Column('varchar', { name: 'prvnc_cd', length: 80, nullable: true })
    public prvncCd: string;

    @Column('varchar', { name: 'prvnc_name', length: 100, nullable: true })
    public prvncName: string;

    @OneToMany(() => MRefHcpHcoEntity, (refHcpHcos) => refHcpHcos.hco, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    public refHcpHcos: MRefHcpHcoEntity[];
}
