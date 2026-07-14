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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
const halls_service_1 = require("../halls/halls.service");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const booking_status_enum_1 = require("../common/enums/booking-status.enum");
let ReviewsService = class ReviewsService {
    constructor(reviewModel, bookingModel, hallsService) {
        this.reviewModel = reviewModel;
        this.bookingModel = bookingModel;
        this.hallsService = hallsService;
    }
    async findByHall(hallId) {
        if (!mongoose_2.Types.ObjectId.isValid(hallId)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        return this.reviewModel
            .find({ hall_id: new mongoose_2.Types.ObjectId(hallId) })
            .populate('user_id', 'name')
            .exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid review id');
        }
        const review = await this.reviewModel
            .findById(id)
            .populate('user_id', 'name email')
            .populate('hall_id', 'name')
            .exec();
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return review;
    }
    async create(dto, userId) {
        await this.hallsService.findOne(dto.hall_id);
        const confirmedBooking = await this.bookingModel.findOne({
            customer_id: new mongoose_2.Types.ObjectId(userId),
            hall_id: new mongoose_2.Types.ObjectId(dto.hall_id),
            status: booking_status_enum_1.BookingStatus.CONFIRMED,
        });
        if (!confirmedBooking) {
            throw new common_1.BadRequestException('يجب أن يكون لديك حجز مؤكد لهذه الصالة قبل التقييم');
        }
        const existing = await this.reviewModel.findOne({
            user_id: new mongoose_2.Types.ObjectId(userId),
            hall_id: new mongoose_2.Types.ObjectId(dto.hall_id),
        });
        if (existing) {
            throw new common_1.BadRequestException('لقد قيّمت هذه الصالة مسبقاً');
        }
        const created = new this.reviewModel({
            user_id: new mongoose_2.Types.ObjectId(userId),
            hall_id: new mongoose_2.Types.ObjectId(dto.hall_id),
            rating: dto.rating,
            review_text: dto.review_text,
        });
        const saved = await created.save();
        await this.hallsService.updateRating(dto.hall_id);
        return this.findOne(saved._id.toString());
    }
    async remove(id) {
        const review = await this.findOne(id);
        const hallId = review.hall_id._id.toString();
        const result = await this.reviewModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('Review not found');
        await this.hallsService.updateRating(hallId);
        return { deleted: true, hallId };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        halls_service_1.HallsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map