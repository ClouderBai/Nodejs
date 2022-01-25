import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MBaseCodeEntity } from './m-base-code.entity';

@Entity({ schema: 'cmd_owner', name: 'm_base_code_ctgry' })
export class MBaseCodeCtgryEntity {
    @PrimaryGeneratedColumn({ name: 'base_code_ctgry_id' })
    public baseCodeCtgryId: number;

    @Column('varchar', { name: 'ctgry_name', length: 100, nullable: false })
    public ctgryName: string;

    @Column('varchar', { name: 'ctgry_englsh_name', length: 200 })
    public ctgryEnglshName: string;

    @Column('varchar', { name: 'ctgry_dscrptn', length: 100 })
    public ctgryDscrptn: string;

    @Column({ name: 'can_maintain', default: 0, nullable: true })
    public canMaintain: number;

    @Column({ name: 'is_from_vn', default: 1, nullable: true })
    public isFromVn: number;

    @Column({ name: 'stts_ind', default: 1 })
    public sttsInd: number;

    @OneToMany(() => MBaseCodeEntity, (baseCodes) => baseCodes.baseCtgry)
    public baseCodes: MBaseCodeEntity[];

    constructor(model: any) {
        Object.assign(this, model);
    }
}
