import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '.';


@Entity({ schema: 'cmd_owner', name: 'veeva_origin_data' })
export class VeevaOriginDataEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column('timestamp', { name: 'start_date' })
    public startDate: Date;

    @Column('timestamp', { name: 'end_date' })
    public endDate: Date;
    
    @Column('int', { name: 'offset' })
    public offset: string;

    @Column('int', { name: 'limit'})
    public limit: string;

    @Column('varchar', { name: 'json_data', length: 100, nullable: false })
    public jsonData: JSON;

    @Column('varchar', { name: 'type' })
    public type: string;

    @Column('varchar', { name: 'url' })
    public url: string;

    constructor(model?: any) {
        super();
        Object.assign(this, model);
    }
}

