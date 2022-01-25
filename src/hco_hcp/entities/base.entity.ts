import { BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';
import moment from 'moment';
import _ from 'lodash';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    public id?: number;

    @Column({ name: 'createduser', nullable: true })
    public createdUser?: string;

    @Column({ name: 'createddate', type: 'timestamp', nullable: true })
    public createdDate?: Date;

    @Column({ name: 'modifieduser', nullable: true })
    public modifiedUser?: string;

    @Column({ name: 'modifieddate', type: 'timestamp', nullable: true })
    public modifiedDate?: Date;

    @Column({ name: 'isdeleted', default: false })
    public isDeleted?: boolean;

    @VersionColumn({ name: 'versionnumber', nullable: true })
    public versionNumber?: number;

    @BeforeInsert()
    public beforeInsertListener() {
        if (_.isNil(this.createdUser)) {
            this.createdUser = 'manual'
            this.modifiedUser = 'manual'
        }
        this.createdDate = moment().utc().toDate();
        this.modifiedDate = moment().utc().toDate();
    }

    @BeforeUpdate()
    public beforeUpdateListener() {
        this.modifiedUser = 'manual'
        this.modifiedDate = moment().utc().toDate();
    }
}
