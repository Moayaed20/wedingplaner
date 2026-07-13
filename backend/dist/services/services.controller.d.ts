import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(type?: string): Promise<import("./schemas/service.schema").Service[]>;
    create(dto: CreateServiceDto): Promise<import("./schemas/service.schema").Service>;
    update(id: string, dto: Partial<CreateServiceDto>): Promise<import("./schemas/service.schema").Service>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
