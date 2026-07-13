import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Decoration } from './schemas/decoration.schema';
import { CreateDecorationDto } from './dto/create-decoration.dto';

@Injectable()
export class DecorationsService {
  constructor(
    @InjectModel(Decoration.name) private decorationModel: Model<Decoration>,
  ) {}

  async findByHall(hallId: string): Promise<Decoration[]> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    return this.decorationModel
      .find({ hall_id: new Types.ObjectId(hallId) })
      .exec();
  }

  async findOne(id: string): Promise<Decoration> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid decoration id');
    }
    const item = await this.decorationModel.findById(id).exec();
    if (!item) throw new NotFoundException('Decoration not found');
    return item;
  }

  async create(hallId: string, dto: CreateDecorationDto): Promise<Decoration> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    const created = new this.decorationModel({
      ...dto,
      hall_id: new Types.ObjectId(hallId),
    });
    return (await created.save()) as unknown as Decoration;
  }

  async update(
    id: string,
    dto: Partial<CreateDecorationDto>,
  ): Promise<Decoration> {
    const item = await this.decorationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Decoration not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.decorationModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Decoration not found');
    return { deleted: true };
  }
}
