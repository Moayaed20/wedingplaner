import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
export declare class CarsController {
    private readonly carsService;
    constructor(carsService: CarsService);
    findByHall(hallId: string): Promise<import("./schemas/car.schema").Car[]>;
    create(hallId: string, dto: CreateCarDto): Promise<import("./schemas/car.schema").Car>;
    update(id: string, dto: Partial<CreateCarDto>): Promise<import("./schemas/car.schema").Car>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
