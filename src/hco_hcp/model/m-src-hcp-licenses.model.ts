import { Expose } from 'class-transformer';

export class MSrcHcpLicensesModel {
    @Expose({ name: 'license_number__v' })
    licenseCd: string;
}
