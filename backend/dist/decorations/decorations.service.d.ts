import { Model } from 'mongoose';
import { Decoration } from './schemas/decoration.schema';
import { CreateDecorationDto } from './dto/create-decoration.dto';
export declare class DecorationsService {
    private decorationModel;
    constructor(decorationModel: Model<Decoration>);
    findByHall(hallId: string): Promise<Decoration[]>;
    findOne(id: string): Promise<Decoration>;
    create(hallId: string, dto: CreateDecorationDto): Promise<Decoration>;
    update(id: string, dto: Partial<CreateDecorationDto>): Promise<Decoration>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
