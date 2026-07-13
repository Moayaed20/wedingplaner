import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Music } from './schemas/music.schema';
import { CreateMusicDto } from './dto/create-music.dto';

@Injectable()
export class MusicService {
  constructor(@InjectModel(Music.name) private musicModel: Model<Music>) {}

  async findByHall(hallId: string): Promise<Music[]> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    return this.musicModel.find({ hall_id: new Types.ObjectId(hallId) }).exec();
  }

  async findOne(id: string): Promise<Music> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid music id');
    }
    const item = await this.musicModel.findById(id).exec();
    if (!item) throw new NotFoundException('Music option not found');
    return item;
  }

  async create(hallId: string, dto: CreateMusicDto): Promise<Music> {
    if (!Types.ObjectId.isValid(hallId)) {
      throw new BadRequestException('Invalid hall id');
    }
    const created = new this.musicModel({
      ...dto,
      hall_id: new Types.ObjectId(hallId),
    });
    return (await created.save()) as unknown as Music;
  }

  async update(id: string, dto: Partial<CreateMusicDto>): Promise<Music> {
    const item = await this.musicModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Music option not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.musicModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Music option not found');
    return { deleted: true };
  }
}
