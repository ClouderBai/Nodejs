import { Column, Entity, OneToMany, PrimaryColumn, VersionColumn } from 'typeorm';
import { MRefHcpHcoEntity } from './m-ref-hcp-hco.entity';

@Entity({ schema: 'cmd_owner', name: 'm_hcp' })
export class MHcpEntity {
    @PrimaryColumn({ name: 'hcp_id' })
    public hcpId: number;

    @Column('varchar', { name: 'vn_entity_id', length: 80, nullable: true })
    public vnEntityId: string;

    @Column('varchar', { name: 'given_name', length: 100 })
    public givenName: string;

    @Column('varchar', { name: 'fmly_name', length: 100, nullable: true })
    public fmlyName: string;

    @Column('varchar', { name: 'alias_name', length: 100, nullable: true })
    public aliasName: string;

    @Column('varchar', { name: 'full_name', length: 100, nullable: true })
    public fullName: string;

    @Column({ name: 'gender', nullable: true })
    public gender: number;

    @Column('varchar', { name: 'hcp_typ_cd', length: 80, nullable: true })
    public hcpTypCd: string;

    @Column('varchar', { name: 'hcp_typ_name', length: 100, nullable: true })
    public hcpTypName: string;

    @Column('varchar', { name: 'clssfctn_cd', length: 80, nullable: true })
    public clssfctnCd: string;

    @Column('varchar', { name: 'clssfctn_name', length: 100, nullable: true })
    public clssfctnName: string;

    @Column('varchar', { name: 'sub_clssfctn_cd', length: 80, nullable: true })
    public subClssFctnCd: string;

    @Column('varchar', { name: 'sub_clssfctn_name', length: 100, nullable: true })
    public subClssFctnName: string;

    @Column({ name: 'stts_ind', nullable: true })
    public sttsInd: number;

    @Column('varchar', { name: 'hcp_stts_cd', nullable: true })
    public hcpSttsCd: string;

    @Column('varchar', { name: 'hcp_stts_name', nullable: true })
    public hcpSttsName: string;

    @Column('varchar', { name: 'acad_cd', length: 80, nullable: true })
    public acadCd: string;

    @Column('varchar', { name: 'acad_title', length: 100, nullable: true })
    public acadTitle: string;

    @Column('varchar', { name: 'prof_cd', length: 80, nullable: true })
    public profCd: string;

    @Column('varchar', { name: 'prof_title', length: 100, nullable: true })
    public profTitle: string;

    @Column({ name: 'clinician', nullable: true })
    public clinician: number;

    @Column({ type: 'timestamp', name: 'efctv_strt_dt', nullable: true })
    public efctvStrtDt: Date;

    @Column({ type: 'timestamp', name: 'efctv_end_dt', nullable: true })
    public efctvEndDt: Date;

    @Column('varchar', { name: 'merged_to', length: 100, nullable: true })
    public mergedTo: string;

    @Column({ type: 'timestamp', name: 'merged_date', nullable: true })
    public mergedDate: Date;

    @Column('varchar', { name: 'spclty_cd', length: 80, nullable: true })
    public spcltyCd: string;

    @Column('varchar', { name: 'spclty_name', length: 100, nullable: true })
    public spcltyName: string;

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

    @Column('varchar', { name: 'prmry_dprtmnt_cd', length: 80, nullable: true })
    public prmryDprtmntCd: string;

    @Column('varchar', { name: 'prmry_dprtmnt_name', length: 100, nullable: true })
    public prmryDprtmntName: string;

    @Column('varchar', { name: 'license_cd', length: 200, nullable: true })
    public licenseCd: string;

    @OneToMany(() => MRefHcpHcoEntity, (refHcpHcos) => refHcpHcos.hcp, { cascade: true })
    public refHcpHcos: MRefHcpHcoEntity[];

    constructor(hcpModel: any) {
        Object.assign(this, hcpModel);
    }
}
