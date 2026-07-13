import { HydratedDocument, Types } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
export type CarDocument = HydratedDocument<Car>;
export declare class Car {
    hall_id: Types.ObjectId;
    car_name: string;
    model: string;
    price: number;
    capacity: number;
    description: string;
    images: string[];
    status: HallStatus;
}
export declare const CarSchema: import("mongoose").Schema<Car, import("mongoose").Model<Car, any, any, any, import("mongoose").Document<unknown, any, Car, any, {}> & Car & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Car, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Car>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Car> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
