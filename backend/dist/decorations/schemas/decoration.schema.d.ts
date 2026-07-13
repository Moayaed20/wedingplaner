import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
export type DecorationDocument = HydratedDocument<Decoration>;
export declare class Decoration {
    hall_id: Types.ObjectId;
    theme_name: string;
    price: number;
    description: string;
    images: string[];
    status: HallStatus;
}
export declare const DecorationSchema: import("mongoose").Schema<Decoration, import("mongoose").Model<Decoration, any, any, any, import("mongoose").Document<unknown, any, Decoration, any, {}> & Decoration & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Decoration, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Decoration>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Decoration> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
