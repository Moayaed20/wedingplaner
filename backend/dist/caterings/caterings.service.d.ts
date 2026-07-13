import { Model } from 'mongoose';
import { Catering } from './schemas/catering.schema';
import { CreateCateringDto } from './dto/create-catering.dto';
export declare class CateringsService {
    private cateringModel;
    constructor(cateringModel: Model<Catering>);
    findByHall(hallId: string): Promise<Catering[]>;
    findOne(id: string): Promise<Catering>;
    create(hallId: string, dto: CreateCateringDto): Promise<Catering>;
    update(id: string, dto: Partial<CreateCateringDto>): Promise<Catering>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
