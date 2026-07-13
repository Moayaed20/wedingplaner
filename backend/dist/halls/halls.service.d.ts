import { Model } from 'mongoose';
import { Hall } from './schemas/hall.schema';
import { CreateHallDto } from './dto/create-hall.dto';
import { FilterHallsDto } from './dto/filter-halls.dto';
import { CalendarStatus } from '../common/enums/calendar-status.enum';
export declare class HallsService {
    private hallModel;
    constructor(hallModel: Model<Hall>);
    findAll(filters: FilterHallsDto): Promise<Hall[]>;
    findOne(id: string): Promise<Hall>;
    findByOwner(ownerId: string): Promise<Hall[]>;
    create(dto: CreateHallDto): Promise<Hall>;
    update(id: string, dto: Partial<CreateHallDto>): Promise<Hall>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    setCalendarStatus(hallId: string, date: Date, status: CalendarStatus): Promise<Hall>;
    removeCalendarStatus(hallId: string, date: Date): Promise<Hall>;
    isDateBooked(hallId: string, date: Date, statuses?: CalendarStatus[]): Promise<boolean>;
    updateRating(hallId: string): Promise<void>;
}
