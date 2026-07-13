import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
export declare class ServicesService {
    private serviceModel;
    constructor(serviceModel: Model<Service>);
    findAll(type?: string): Promise<Service[]>;
    findOne(id: string): Promise<Service>;
    create(dto: CreateServiceDto): Promise<Service>;
    update(id: string, dto: Partial<CreateServiceDto>): Promise<Service>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
