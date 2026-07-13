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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("./schemas/booking.schema");
const halls_service_1 = require("../halls/halls.service");
const caterings_service_1 = require("../caterings/caterings.service");
const decorations_service_1 = require("../decorations/decorations.service");
const cars_service_1 = require("../cars/cars.service");
const music_service_1 = require("../music/music.service");
const booking_status_enum_1 = require("../common/enums/booking-status.enum");
const calendar_status_enum_1 = require("../common/enums/calendar-status.enum");
let BookingsService = class BookingsService {
    constructor(bookingModel, hallsService, cateringsService, decorationsService, carsService, musicService) {
        this.bookingModel = bookingModel;
        this.hallsService = hallsService;
        this.cateringsService = cateringsService;
        this.decorationsService = decorationsService;
        this.carsService = carsService;
        this.musicService = musicService;
    }
    normalizeDate(d) {
        const date = new Date(d);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }
    async findAll() {
        return this.bookingModel
            .find()
            .populate('customer_id', 'name email')
            .populate('hall_id', 'name city')
            .populate('selected_decoration_id', 'theme_name price')
            .populate('selected_car_id', 'car_name model price')
            .populate('selected_music_id', 'name type price')
            .exec();
    }
    async findByCustomer(customerId) {
        return this.bookingModel
            .find({ customer_id: new mongoose_2.Types.ObjectId(customerId) })
            .populate('hall_id', 'name city')
            .populate('selected_decoration_id', 'theme_name price')
            .populate('selected_car_id', 'car_name model price')
            .populate('selected_music_id', 'name type price')
            .exec();
    }
    async findByHall(hallId, status) {
        const query = { hall_id: new mongoose_2.Types.ObjectId(hallId) };
        if (status)
            query.status = status;
        return this.bookingModel
            .find(query)
            .populate('customer_id', 'name email')
            .populate('selected_decoration_id', 'theme_name price')
            .populate('selected_car_id', 'car_name model price')
            .populate('selected_music_id', 'name type price')
            .exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid booking id');
        }
        const booking = await this.bookingModel
            .findById(id)
            .populate('customer_id', 'name email')
            .populate('hall_id')
            .populate('selected_decoration_id', 'theme_name price')
            .populate('selected_car_id', 'car_name model price')
            .populate('selected_music_id', 'name type price')
            .exec();
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async create(dto, customerId) {
        const hall = await this.hallsService.findOne(dto.hall_id);
        const eventDate = this.normalizeDate(dto.event_date);
        if (await this.hallsService.isDateBooked(dto.hall_id, eventDate, [
            calendar_status_enum_1.CalendarStatus.BOOKED,
        ])) {
            throw new common_1.BadRequestException('This date is already booked');
        }
        if (dto.guest_count < hall.min_capacity || dto.guest_count > hall.max_capacity) {
            throw new common_1.BadRequestException(`Guest count must be between ${hall.min_capacity} and ${hall.max_capacity}`);
        }
        let total = hall.price_per_person * dto.guest_count;
        const selectedCaterings = [];
        if (dto.selected_caterings?.length) {
            for (const item of dto.selected_caterings) {
                const catering = await this.cateringsService.findOne(item.catering_id);
                if (catering.hall_id.toString() !== dto.hall_id) {
                    throw new common_1.BadRequestException('Catering does not belong to selected hall');
                }
                const subtotal = catering.price_per_person * dto.guest_count * item.quantity;
                total += subtotal;
                selectedCaterings.push({
                    catering_id: catering._id,
                    name: catering.menu_name,
                    price_per_person: catering.price_per_person,
                    total: subtotal,
                });
            }
        }
        const created = new this.bookingModel({
            customer_id: new mongoose_2.Types.ObjectId(customerId),
            hall_id: new mongoose_2.Types.ObjectId(dto.hall_id),
            event_date: eventDate,
            guest_count: dto.guest_count,
            status: booking_status_enum_1.BookingStatus.PENDING,
            total_price: total,
            selected_caterings: selectedCaterings,
            selected_decoration_id: dto.selected_decoration_id
                ? new mongoose_2.Types.ObjectId(dto.selected_decoration_id)
                : null,
            selected_car_id: dto.selected_car_id
                ? new mongoose_2.Types.ObjectId(dto.selected_car_id)
                : null,
            selected_music_id: dto.selected_music_id
                ? new mongoose_2.Types.ObjectId(dto.selected_music_id)
                : null,
            qr_code: null,
        });
        if (dto.selected_decoration_id) {
            const decoration = await this.decorationsService.findOne(dto.selected_decoration_id);
            if (decoration.hall_id.toString() !== dto.hall_id) {
                throw new common_1.BadRequestException('Decoration does not belong to selected hall');
            }
            total += decoration.price;
        }
        if (dto.selected_car_id) {
            const car = await this.carsService.findOne(dto.selected_car_id);
            if (car.hall_id.toString() !== dto.hall_id) {
                throw new common_1.BadRequestException('Car does not belong to selected hall');
            }
            total += car.price;
        }
        if (dto.selected_music_id) {
            const music = await this.musicService.findOne(dto.selected_music_id);
            if (music.hall_id.toString() !== dto.hall_id) {
                throw new common_1.BadRequestException('Music does not belong to selected hall');
            }
            total += music.price;
        }
        created.total_price = total;
        const saved = await created.save();
        await this.hallsService.setCalendarStatus(dto.hall_id, eventDate, calendar_status_enum_1.CalendarStatus.PENDING);
        return this.findOne(saved._id.toString());
    }
    async confirm(id) {
        const booking = await this.findOne(id);
        if (booking.status !== booking_status_enum_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be confirmed');
        }
        const eventDate = this.normalizeDate(booking.event_date);
        if (await this.hallsService.isDateBooked(booking.hall_id._id.toString(), eventDate, [calendar_status_enum_1.CalendarStatus.BOOKED])) {
            throw new common_1.BadRequestException('This date is already booked by another event');
        }
        booking.status = booking_status_enum_1.BookingStatus.CONFIRMED;
        await booking.save();
        await this.hallsService.setCalendarStatus(booking.hall_id._id.toString(), eventDate, calendar_status_enum_1.CalendarStatus.BOOKED);
        return this.findOne(id);
    }
    async reject(id) {
        const booking = await this.findOne(id);
        if (booking.status === booking_status_enum_1.BookingStatus.REJECTED) {
            throw new common_1.BadRequestException('Booking already rejected');
        }
        booking.status = booking_status_enum_1.BookingStatus.REJECTED;
        await booking.save();
        await this.hallsService.removeCalendarStatus(booking.hall_id._id.toString(), this.normalizeDate(booking.event_date));
        return this.findOne(id);
    }
    async cancel(id) {
        const booking = await this.findOne(id);
        if (booking.status !== booking_status_enum_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be cancelled');
        }
        booking.status = booking_status_enum_1.BookingStatus.CANCELLED;
        await booking.save();
        await this.hallsService.removeCalendarStatus(booking.hall_id._id.toString(), this.normalizeDate(booking.event_date));
        return this.findOne(id);
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        halls_service_1.HallsService,
        caterings_service_1.CateringsService,
        decorations_service_1.DecorationsService,
        cars_service_1.CarsService,
        music_service_1.MusicService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map