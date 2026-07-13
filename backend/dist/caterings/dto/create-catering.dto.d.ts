import { HallStatus } from '../../common/enums/hall-status.enum';
export declare class CreateCateringDto {
    menu_name: string;
    price_per_person: number;
    menu_type: string;
    description?: string;
    images?: string[];
    status?: HallStatus;
}
