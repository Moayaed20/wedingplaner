import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
import { CalendarStatus } from '../../common/enums/calendar-status.enum';
export type HallDocument = HydratedDocument<Hall>;
export declare class Hall {
    [key: string]: any;
    _id: Types.ObjectId;
    owner_id: Types.ObjectId | null;
    name: string;
    address: string;
    city: string;
    postcode: string;
    price_per_person: number;
    min_capacity: number;
    max_capacity: number;
    rating: number;
    images: string[];
    images_360: string[];
    contact: string;
    status: HallStatus;
    availability_calendar: {
        date: Date;
        status: CalendarStatus;
    }[];
}
export declare const HallSchema: import("mongoose").Schema<Hall, import("mongoose").Model<Hall, any, any, any, import("mongoose").Document<unknown, any, Hall, any, {}> & Hall & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Hall, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Hall>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Hall> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
