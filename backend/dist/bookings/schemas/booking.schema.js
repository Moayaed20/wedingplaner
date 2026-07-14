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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSchema = exports.Booking = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_status_enum_1 = require("../../common/enums/booking-status.enum");
let Booking = class Booking {
};
exports.Booking = Booking;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "customer_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Hall', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "hall_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Booking.prototype, "event_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Booking.prototype, "guest_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: booking_status_enum_1.BookingStatus, default: booking_status_enum_1.BookingStatus.PENDING }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "total_price", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                catering_id: { type: mongoose_2.Types.ObjectId, ref: 'Catering', required: true },
                name: String,
                price_per_person: Number,
                total: Number,
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Booking.prototype, "selected_caterings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Decoration' }], default: [] }),
    __metadata("design:type", Array)
], Booking.prototype, "selected_decoration_ids", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Car', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "selected_car_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Music' }], default: [] }),
    __metadata("design:type", Array)
], Booking.prototype, "selected_music_ids", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Booking.prototype, "qr_code", void 0);
exports.Booking = Booking = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'bookings' })
], Booking);
exports.BookingSchema = mongoose_1.SchemaFactory.createForClass(Booking);
//# sourceMappingURL=booking.schema.js.map