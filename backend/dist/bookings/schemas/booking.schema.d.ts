import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../common/enums/booking-status.enum';
export type BookingDocument = HydratedDocument<Booking>;
export declare class Booking {
    [key: string]: any;
    _id: Types.ObjectId;
    customer_id: Types.ObjectId;
    hall_id: Types.ObjectId;
    event_date: Date;
    guest_count: number;
    status: BookingStatus;
    total_price: number;
    selected_caterings: {
        catering_id: Types.ObjectId;
        name: string;
        price_per_person: number;
        total: number;
    }[];
    selected_decoration_ids: Types.ObjectId[];
    selected_car_id: Types.ObjectId | null;
    selected_music_ids: Types.ObjectId[];
    qr_code: string | null;
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, import("mongoose").Document<unknown, any, Booking, any, {}> & Booking & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Booking> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
