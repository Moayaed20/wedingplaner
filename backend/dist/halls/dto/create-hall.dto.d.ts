import { HallStatus } from '../../common/enums/hall-status.enum';
export declare class CreateHallDto {
    owner_id?: string;
    name: string;
    address: string;
    city: string;
    postcode?: string;
    price_per_person: number;
    min_capacity: number;
    max_capacity: number;
    contact?: string;
    status?: HallStatus;
    images?: string[];
}
