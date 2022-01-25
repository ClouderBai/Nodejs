import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'cmd_owner', name: 'm_city' })
export class MCityEntity {
    @PrimaryGeneratedColumn({ name: 'city_id' })
    public cityId: number;

    @Column('varchar', { name: 'city_cd', length: 200 })
    public cityCd: string;

    @Column('varchar', { name: 'city_name', length: 100 })
    public cityName: string;

    @Column('varchar', { name: 'city_englsh_name', length: 1600, nullable: true })
    public cityEnglshname: string;

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

    @Column('varchar', { name: 'prvnc_cd', length: 40 })
    public prvncCd: string;
}
