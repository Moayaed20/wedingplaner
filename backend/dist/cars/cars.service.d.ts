import { Model } from 'mongoose';
import { Car } from './schemas/car.schema';
import { CreateCarDto } from './dto/create-car.dto';
export declare class CarsService {
    private carModel;
    constructor(carModel: Model<Car>);
    findByHall(hallId: string): Promise<Car[]>;
    findOne(id: string): Promise<Car>;
    create(hallId: string, dto: CreateCarDto): Promise<Car>;
    update(id: string, dto: Partial<CreateCarDto>): Promise<Car>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
