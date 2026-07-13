import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
export type MusicDocument = HydratedDocument<Music>;
export declare class Music {
    hall_id: Types.ObjectId;
    name: string;
    type: string;
    price: number;
    description: string;
    status: HallStatus;
}
export declare const MusicSchema: import("mongoose").Schema<Music, import("mongoose").Model<Music, any, any, any, import("mongoose").Document<unknown, any, Music, any, {}> & Music & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Music, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Music>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Music> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
