import { DecorationsService } from './decorations.service';
import { CreateDecorationDto } from './dto/create-decoration.dto';
export declare class DecorationsController {
    private readonly decorationsService;
    constructor(decorationsService: DecorationsService);
    findByHall(hallId: string): Promise<import("./schemas/decoration.schema").Decoration[]>;
    create(hallId: string, dto: CreateDecorationDto): Promise<import("./schemas/decoration.schema").Decoration>;
    update(id: string, dto: Partial<CreateDecorationDto>): Promise<import("./schemas/decoration.schema").Decoration>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
