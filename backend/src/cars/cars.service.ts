import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car } from './schemas/car.schema';
import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<Car>) {}

  async findByHall(hallId: string): Promise<Car[]> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    return this.carModel.find({ hall_id: new Types.ObjectId(hallId) }).exec();
  }

  async findOne(id: string): Promise<Car> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid car id');
    }
    const item = await this.carModel.findById(id).exec();
    if (!item) throw new NotFoundException('Car not found');
    return item;
  }

  async create(hallId: string, dto: CreateCarDto): Promise<Car> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    const created = new this.carModel({
      ...dto,
      hall_id: new Types.ObjectId(hallId),
    });
    return (await created.save()) as unknown as Car;
  }

  async update(id: string, dto: Partial<CreateCarDto>): Promise<Car> {
    const item = await this.carModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Car not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.carModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Car not found');
    return { deleted: true };
  }
}
