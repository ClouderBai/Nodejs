import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '.';

@Entity({ schema: 'cmd_owner', name: 'veeva_hcp' })
export class VeevaHcpEntity extends BaseEntity{
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column('varchar', { name: 'vn_entity_id', length: 200, nullable: true })
    public vnEntityId: string;

    @Column('varchar', { name: 'json_data', length: 100, nullable: false })
    public jsonData: JSON;

    constructor(model?: any) {
        super();
        Object.assign(this, model);
    }
}
