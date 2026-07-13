import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hall } from './schemas/hall.schema';
import { CreateHallDto } from './dto/create-hall.dto';
import { FilterHallsDto } from './dto/filter-halls.dto';
import { HallStatus } from '../common/enums/hall-status.enum';
import { CalendarStatus } from '../common/enums/calendar-status.enum';

@Injectable()
export class HallsService {
  constructor(@InjectModel(Hall.name) private hallModel: Model<Hall>) {}

  async findAll(filters: FilterHallsDto): Promise<Hall[]> {
    const query: any = { status: HallStatus.ACTIVE };

    if (filters.city) {
      query.city = { $regex: filters.city, $options: 'i' };
    }
    if (filters.minCapacity !== undefined) {
      query.max_capacity = { $gte: filters.minCapacity };
    }
    if (filters.maxCapacity !== undefined) {
      query.min_capacity = { ...query.min_capacity, $lte: filters.maxCapacity };
    }
    if (filters.maxPrice !== undefined) {
      query.price_per_person = { $lte: filters.maxPrice };
    }
    if (filters.rating !== undefined) {
      query.rating = { $gte: filters.rating };
    }

    return this.hallModel.find(query).populate('owner_id', 'name email').exec();
  }

  async findOne(id: string): Promise<Hall> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid hall id');
    }
    const hall = await this.hallModel
      .findById(id)
      .populate('owner_id', 'name email')
      .exec();
    if (!hall) throw new NotFoundException('Hall not found');
    return hall;
  }

  async findByOwner(ownerId: string): Promise<Hall[]> {
    return this.hallModel
      .find({ owner_id: new Types.ObjectId(ownerId) })
      .exec();
  }

  async create(dto: CreateHallDto): Promise<Hall> {
    const data: any = { ...dto };
    if (dto.owner_id) {
      data.owner_id = new Types.ObjectId(dto.owner_id);
    }
    const created = new this.hallModel(data);
    return (await created.save()) as unknown as Hall;
  }

  async update(id: string, dto: Partial<CreateHallDto>): Promise<Hall> {
    const update: any = { ...dto };
    if (dto.owner_id) {
      update.owner_id = new Types.ObjectId(dto.owner_id);
    }

    const hall = await this.hallModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('owner_id', 'name email')
      .exec();
    if (!hall) throw new NotFoundException('Hall not found');
    return hall;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.hallModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Hall not found');
    return { deleted: true };
  }

  async setCalendarStatus(
    hallId: string,
    date: Date,
    status: CalendarStatus,
  ): Promise<Hall> {
    const hall = await this.findOne(hallId);
    const iso = new Date(date).toISOString();

    const idx = (hall.availability_calendar || []).findIndex(
      (c) => new Date(c.date).toISOString() === iso,
    );

    if (idx === -1) {
      hall.availability_calendar.push({ date: new Date(date), status });
    } else {
      hall.availability_calendar[idx].status = status;
    }

    await hall.save();
    return hall;
  }

  async removeCalendarStatus(hallId: string, date: Date): Promise<Hall> {
    const hall = await this.findOne(hallId);
    const iso = new Date(date).toISOString();

    hall.availability_calendar = hall.availability_calendar.filter(
      (c) => new Date(c.date).toISOString() !== iso,
    );

    await hall.save();
    return hall;
  }

  async isDateBooked(
    hallId: string,
    date: Date,
    statuses: CalendarStatus[] = [CalendarStatus.BOOKED],
  ): Promise<boolean> {
    const hall = await this.findOne(hallId);
    const iso = new Date(date).toISOString();
    return (hall.availability_calendar || []).some(
      (c) =>
        new Date(c.date).toISOString() === iso && statuses.includes(c.status),
    );
  }

  async updateRating(hallId: string): Promise<void> {
    const result = await this.hallModel.db
      .collection('reviews')
      .aggregate([
        { $match: { hall_id: new Types.ObjectId(hallId) } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ])
      .next();
    await this.hallModel.findByIdAndUpdate(hallId, {
      rating: result ? Math.round(result.avg * 10) / 10 : 0,
    });
  }
}
