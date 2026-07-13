import { HallStatus } from '../../common/enums/hall-status.enum';
export declare class CreateDecorationDto {
    theme_name: string;
    price: number;
    description?: string;
    images?: string[];
    status?: HallStatus;
}
