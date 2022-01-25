import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MHcpEntity } from './m-hcp.entity';
import { MHcoEntity } from './m-hco.entity';

@Entity({ schema: 'cmd_owner', name: 'm_ref_hcp_hco' })
export class MRefHcpHcoEntity {
    @PrimaryGeneratedColumn({ name: 'ref_hcp_hco_id' })
    public refHcpHcoId: number;

    @Column({ name: 'is_prmry', nullable: true })
    public isPrmry: number;

    @Column('varchar', { name: 'afltn_role_cd', length: 80 })
    public afltnRoleCd: string;

    @Column('varchar', { name: 'afltn_role_name', length: 100, nullable: true })
    public afltnRoleName: string;

    @Column('varchar', { name: 'prnt_hco_stts', length: 100, nullable: true })
    public prntHcoStts: string;

    @Column('varchar', { name: 'rcrd_state_cd', length: 100, nullable: true })
    public rcrdStateCd: string;

    @Column({ name: 'is_veeva_master', nullable: true })
    public isVeevaMaster: boolean;

    @ManyToOne(() => MHcpEntity, (hcp) => hcp.refHcpHcos)
    @JoinColumn({ name: 'hcp_id' })
    public hcp: number;

    @ManyToOne(() => MHcoEntity, (hco) => hco.refHcpHcos)
    @JoinColumn({ name: 'hco_id' })
    public hco: number;

    constructor(model: any) {
        Object.assign(this, model);
    }
}
