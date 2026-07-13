import { HallStatus } from '../../common/enums/hall-status.enum';
export declare class CreateCarDto {
    car_name: string;
    model: string;
    price: number;
    capacity: number;
    description?: string;
    images?: string[];
    status?: HallStatus;
}
