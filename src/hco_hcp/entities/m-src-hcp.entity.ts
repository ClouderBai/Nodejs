import { Column, Entity } from 'typeorm';
import { BaseEntity, MSrcRefHcpHcoEntity } from '.';
import { MSrcHcpModel } from '../model';

@Entity({ schema: 'cmd_owner', name: 'm_src_hcp' })
export class MSrcHcpEntity extends BaseEntity {
    @Column('varchar', { name: 'vn_entity_id', length: 80, nullable: true })
    public vnEntityId: string;

    @Column({ name: 'hcp_id' })
    public hcpId: number;

    @Column('varchar', { name: 'given_name', length: 100 })
    public givenName: string;

    @Column('varchar', { name: 'fmly_name', length: 100 })
    public fmlyName: string;

    @Column('varchar', { name: 'alias_name', length: 100, nullable: true })
    public aliasName: string;

    @Column({ type: 'varchar', name: 'gender' })
    public gender: string;

    @Column('varchar', { name: 'clssfctn_cd', length: 80, nullable: true })
    public clssfctnCd: string;

    @Column('varchar', { name: 'sub_clssfctn_cd', length: 80, nullable: true })
    public subClssFctnCd: string;

    @Column('varchar', { name: 'acad_cd', length: 100, nullable: true })
    public acadCd: string;

    @Column('varchar', { name: 'prof_cd', length: 100, nullable: true })
    public profCd: string;

    @Column({ type: 'timestamp', name: 'efctv_strt_dt', nullable: true })
    public efctvStrtDt: Date;

    @Column({ type: 'timestamp', name: 'efctv_end_dt', nullable: true })
    public efctvEndDt: Date;

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

    @Column('varchar', { name: 'spclty_cd', length: 80, nullable: true })
    public spcltyCd: string;

    @Column({ type: 'varchar', name: 'hcp_stts_cd', nullable: true })
    public hcpSttsCd: string;

    @Column('varchar', { name: 'hcp_typ_cd', length: 80, nullable: true })
    public hcpTypCd: string;

    @Column('varchar', { name: 'rcrd_state_cd', length: 80, nullable: true })
    public rcrdStateCd: string;

    @Column('varchar', { name: 'prmry_dprtmnt_cd', length: 80, nullable: true })
    public prmryDprtmntCd: string;

    @Column('varchar', { name: 'license_cd', length: 200, nullable: true })
    public licenseCd: string;

    public srcRefHcpHcos: MSrcRefHcpHcoEntity[];

    constructor(msrcHcpModel: MSrcHcpModel) {
        super();
        Object.assign(this, msrcHcpModel);
    }
}
