import { CateringsService } from './caterings.service';
import { CreateCateringDto } from './dto/create-catering.dto';
export declare class CateringsController {
    private readonly cateringsService;
    constructor(cateringsService: CateringsService);
    findByHall(hallId: string): Promise<import("./schemas/catering.schema").Catering[]>;
    create(hallId: string, dto: CreateCateringDto): Promise<import("./schemas/catering.schema").Catering>;
    update(id: string, dto: Partial<CreateCateringDto>): Promise<import("./schemas/catering.schema").Catering>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
