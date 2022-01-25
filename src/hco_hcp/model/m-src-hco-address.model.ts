import { Expose } from 'class-transformer'

export class MSrcHcoAddressModel {
    @Expose({ name: 'address_line_1__v' })
    adrsLine1: string;

    @Expose({ name: 'sub_administrative_area__v' })
    subAdministrativeArea: string;

    @Expose({ name: 'locality__v' })
    locality: string;

    @Expose({ name: 'address_line_2__v' })
    adrsLine2: string;

    @Expose({ name: 'address_status__v' })
    addressStatus: string;

    @Expose({ name: 'formatted_address__v' })
    formattedAddress: string;

    @Expose({ name: 'postal_code__v' })
    pstl: string;

    @Expose({ name: 'administrative_area__v' })
    prvncCd: string;
}
