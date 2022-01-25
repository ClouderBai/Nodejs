import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MBaseCodeCtgryEntity } from './m-base-code-ctgry.entity';

@Entity({ schema: 'cmd_owner', name: 'm_base_code' })
export class MBaseCodeEntity {
    @PrimaryGeneratedColumn({ name: 'base_code_id' })
    public baseCodeId: number;

    @Column('varchar', { name: 'code', length: 200, nullable: true })
    public code: string;

    @Column('varchar', { name: 'name', length: 100, nullable: false })
    public name: string;

    @Column('varchar', { name: 'englsh_name', length: 200, nullable: true })
    public englishName: string;

    @Column({ name: 'stts_ind', default: 1 })
    public sttsInd: number;

    @ManyToOne(() => MBaseCodeCtgryEntity, (baseCtgry) => baseCtgry.baseCodes)
    @JoinColumn({ name: 'base_ctgry_id' })
    public baseCtgry: MBaseCodeCtgryEntity;

    constructor(model?: any) {
        Object.assign(this, model);
    }
}
