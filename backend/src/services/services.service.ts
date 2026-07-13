import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<Service>) {}

  async findAll(type?: string): Promise<Service[]> {
    const query: any = {};
    if (type) query.type = { $regex: type, $options: 'i' };
    return this.serviceModel.find(query).exec();
  }

  async findOne(id: string): Promise<Service> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }
    const item = await this.serviceModel.findById(id).exec();
    if (!item) throw new NotFoundException('Service not found');
    return item;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const created = new this.serviceModel(dto);
    return (await created.save()) as unknown as Service;
  }

  async update(id: string, dto: Partial<CreateServiceDto>): Promise<Service> {
    const item = await this.serviceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Service not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Service not found');
    return { deleted: true };
  }
}
