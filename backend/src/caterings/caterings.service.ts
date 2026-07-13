import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Catering } from './schemas/catering.schema';
import { CreateCateringDto } from './dto/create-catering.dto';

@Injectable()
export class CateringsService {
  constructor(@InjectModel(Catering.name) private cateringModel: Model<Catering>) {}

  async findByHall(hallId: string): Promise<Catering[]> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    return this.cateringModel.find({ hall_id: new Types.ObjectId(hallId) }).exec();
  }

  async findOne(id: string): Promise<Catering> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid catering id');
    }
    const item = await this.cateringModel.findById(id).exec();
    if (!item) throw new NotFoundException('Catering not found');
    return item;
  }

  async create(hallId: string, dto: CreateCateringDto): Promise<Catering> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    const created = new this.cateringModel({
      ...dto,
      hall_id: new Types.ObjectId(hallId),
    });
    return (await created.save()) as unknown as Catering;
  }

  async update(id: string, dto: Partial<CreateCateringDto>): Promise<Catering> {
    const item = await this.cateringModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Catering not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.cateringModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Catering not found');
    return { deleted: true };
  }
}
