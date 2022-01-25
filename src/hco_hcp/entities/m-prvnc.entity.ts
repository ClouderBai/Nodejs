import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: 'cmd_owner', name: 'm_prvnc' })
export class MPrvncEntity {
    @PrimaryGeneratedColumn({ name: 'prvnc_id' })
    public prvncId: number;

    @Column('varchar', { name: 'prvnc_cd', length: 80 })
    public prvncCd: string;

    @Column('varchar', { name: 'prvnc_name', length: 100 })
    public prvncName: string;

    @Column('varchar', { name: 'prvnc_englsh_name', length: 1600 })
    public prvncEnglshName: string;

    @Column({ name: 'stts_ind' })
    public sttsInd: number;

    @Column('varchar', { name: 'crt_user', length: 80 })
    public crtUser: string;

    @Column({ type: 'timestamp', name: 'crt_dt' })
    public crtDt: Date;

    @Column('varchar', { name: 'updt_user', length: 80 })
    public updtUser: string;

    @Column({ type: 'timestamp', name: 'updt_dt' })
    public updtDt: Date;

    @Column({ type: 'int4', name: 'star_id' })
    public starId: number;
}
