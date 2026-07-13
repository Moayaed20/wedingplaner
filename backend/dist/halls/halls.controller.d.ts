import { HallsService } from "./halls.service";
import { CreateHallDto } from "./dto/create-hall.dto";
import { FilterHallsDto } from "./dto/filter-halls.dto";
export declare class HallsController {
    private readonly hallsService;
    constructor(hallsService: HallsService);
    findAll(filters: FilterHallsDto): Promise<import("./schemas/hall.schema").Hall[]>;
    findMine(userId: string): Promise<import("./schemas/hall.schema").Hall[]>;
    findOne(id: string): Promise<import("./schemas/hall.schema").Hall>;
    create(dto: CreateHallDto): Promise<import("./schemas/hall.schema").Hall>;
    update(id: string, dto: Partial<CreateHallDto>, user: any): Promise<import("./schemas/hall.schema").Hall>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
