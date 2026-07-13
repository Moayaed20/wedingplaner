"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hall_schema_1 = require("./schemas/hall.schema");
const hall_status_enum_1 = require("../common/enums/hall-status.enum");
const calendar_status_enum_1 = require("../common/enums/calendar-status.enum");
let HallsService = class HallsService {
    constructor(hallModel) {
        this.hallModel = hallModel;
    }
    async findAll(filters) {
        const query = { status: hall_status_enum_1.HallStatus.ACTIVE };
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
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        const hall = await this.hallModel
            .findById(id)
            .populate('owner_id', 'name email')
            .exec();
        if (!hall)
            throw new common_1.NotFoundException('Hall not found');
        return hall;
    }
    async findByOwner(ownerId) {
        return this.hallModel
            .find({ owner_id: new mongoose_2.Types.ObjectId(ownerId) })
            .exec();
    }
    async create(dto) {
        const data = { ...dto };
        if (dto.owner_id) {
            data.owner_id = new mongoose_2.Types.ObjectId(dto.owner_id);
        }
        const created = new this.hallModel(data);
        return (await created.save());
    }
    async update(id, dto) {
        const update = { ...dto };
        if (dto.owner_id) {
            update.owner_id = new mongoose_2.Types.ObjectId(dto.owner_id);
        }
        const hall = await this.hallModel
            .findByIdAndUpdate(id, update, { new: true })
            .populate('owner_id', 'name email')
            .exec();
        if (!hall)
            throw new common_1.NotFoundException('Hall not found');
        return hall;
    }
    async remove(id) {
        const result = await this.hallModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('Hall not found');
        return { deleted: true };
    }
    async setCalendarStatus(hallId, date, status) {
        const hall = await this.findOne(hallId);
        const iso = new Date(date).toISOString();
        const idx = (hall.availability_calendar || []).findIndex((c) => new Date(c.date).toISOString() === iso);
        if (idx === -1) {
            hall.availability_calendar.push({ date: new Date(date), status });
        }
        else {
            hall.availability_calendar[idx].status = status;
        }
        await hall.save();
        return hall;
    }
    async removeCalendarStatus(hallId, date) {
        const hall = await this.findOne(hallId);
        const iso = new Date(date).toISOString();
        hall.availability_calendar = hall.availability_calendar.filter((c) => new Date(c.date).toISOString() !== iso);
        await hall.save();
        return hall;
    }
    async isDateBooked(hallId, date, statuses = [calendar_status_enum_1.CalendarStatus.BOOKED]) {
        const hall = await this.findOne(hallId);
        const iso = new Date(date).toISOString();
        return (hall.availability_calendar || []).some((c) => new Date(c.date).toISOString() === iso && statuses.includes(c.status));
    }
    async updateRating(hallId) {
        const result = await this.hallModel.db
            .collection('reviews')
            .aggregate([
            { $match: { hall_id: new mongoose_2.Types.ObjectId(hallId) } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ])
            .next();
        await this.hallModel.findByIdAndUpdate(hallId, {
            rating: result ? Math.round(result.avg * 10) / 10 : 0,
        });
    }
};
exports.HallsService = HallsService;
exports.HallsService = HallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(hall_schema_1.Hall.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], HallsService);
//# sourceMappingURL=halls.service.js.map