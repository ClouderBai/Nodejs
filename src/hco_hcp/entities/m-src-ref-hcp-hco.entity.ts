import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: 'cmd_owner', name: 'm_src_ref_hcp_hco' })
export class MSrcRefHcpHcoEntity {
    @PrimaryGeneratedColumn({ name: 'ref_hcp_hco_id' })
    public refHcpHcoId: number;

    @Column({ name: 'is_prmry', nullable: true })
    public isPrmry: number;

    @Column('varchar', { name: 'afltn_role_cd', length: 80 })
    public afltnRoleCd: string;

    @Column('varchar', { name: 'hco_vn_entity_id', length: 80 })
    public hcoVnEntityId: string;

    @Column('varchar', { name: 'prnt_hco_stts', length: 100, nullable: true })
    public prntHcoStts: string;

    @Column('varchar', { name: 'rcrd_state_cd', length: 100, nullable: true })
    public rcrdStateCd: string;

    @Column({ name: 'is_veeva_master', nullable: true })
    public isVeevaMaster: boolean;

    @Column({ name: 'hcp_id' })
    public hcpId: number;

    constructor(srcRefHcpHcoModel: any) {
        Object.assign(this, srcRefHcpHcoModel);
    }
}
