import { HallStatus } from '../../common/enums/hall-status.enum';
export declare class CreateMusicDto {
    name: string;
    type: string;
    price: number;
    description?: string;
    status?: HallStatus;
}
