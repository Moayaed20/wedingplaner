import { HydratedDocument } from 'mongoose';
import { HallStatus } from '../../common/enums/hall-status.enum';
export type ServiceDocument = HydratedDocument<Service>;
export declare class Service {
    type: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    status: HallStatus;
}
export declare const ServiceSchema: import("mongoose").Schema<Service, import("mongoose").Model<Service, any, any, any, import("mongoose").Document<unknown, any, Service, any, {}> & Service & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Service>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Service> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
