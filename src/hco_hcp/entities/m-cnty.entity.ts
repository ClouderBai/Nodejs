import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: 'cmd_owner', name: 'm_cnty' })
export class MCntyEntity {
    @PrimaryGeneratedColumn({ name: 'cnty_id' })
    public cntyId: number;

    @Column('varchar', { name: 'cnty_cd', length: 200 })
    public cntyCd: string;

    @Column('varchar', { name: 'cnty_name', length: 100 })
    public cntyName: string;

    @Column({ name: 'stts_ind' })
    public sttsInd: number;

    @Column('varchar', { name: 'crt_user', length: 80, nullable: true })
    public crtUser: string;

    @Column({ type: 'timestamp', name: 'crt_dt', nullable: true })
    public crtDt: Date;

    @Column('varchar', { name: 'updt_user', length: 80, nullable: true })
    public updtUser: string;

    @Column({ type: 'timestamp', name: 'updt_dt', nullable: true })
    public updtDt: Date;

    @Column('varchar', { name: 'city_cd', length: 80 })
    public cityCd: string;
}
