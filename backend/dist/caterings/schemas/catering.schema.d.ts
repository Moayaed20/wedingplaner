import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
export type CateringDocument = HydratedDocument<Catering>;
export declare class Catering {
    _id: Types.ObjectId;
    hall_id: Types.ObjectId;
    menu_name: string;
    price_per_person: number;
    menu_type: string;
    description: string;
    status: HallStatus;
}
export declare const CateringSchema: import("mongoose").Schema<Catering, import("mongoose").Model<Catering, any, any, any, import("mongoose").Document<unknown, any, Catering, any, {}> & Catering & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Catering, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Catering>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Catering> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
