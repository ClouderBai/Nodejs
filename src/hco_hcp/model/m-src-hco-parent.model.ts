import { Expose } from 'class-transformer';

export class MSrcHcoParentModel {
    @Expose({ name: 'parent_hco_vid__v' })
    parentHcoVId: string;
}
