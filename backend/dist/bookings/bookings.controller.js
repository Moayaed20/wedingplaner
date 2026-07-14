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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const booking_status_enum_1 = require("../common/enums/booking-status.enum");
const halls_service_1 = require("../halls/halls.service");
let BookingsController = class BookingsController {
    constructor(bookingsService, hallsService) {
        this.bookingsService = bookingsService;
        this.hallsService = hallsService;
    }
    async findAll() {
        return this.bookingsService.findAll();
    }
    async create(dto, user) {
        const customerId = user.role === user_role_enum_1.UserRole.ADMIN && dto.customer_id
            ? dto.customer_id
            : user.userId;
        return this.bookingsService.create(dto, customerId);
    }
    async findMyBookings(userId) {
        return this.bookingsService.findByCustomer(userId);
    }
    async findByHall(hallId, user, status) {
        if (user.role === user_role_enum_1.UserRole.HALL_OWNER) {
            const hall = await this.hallsService.findOne(hallId);
            const ownerId = hall.owner_id?._id
                ? hall.owner_id._id.toString()
                : hall.owner_id?.toString();
            if (ownerId !== user.userId) {
                throw new common_1.ForbiddenException('You can only view bookings for your own halls');
            }
        }
        return this.bookingsService.findByHall(hallId, status);
    }
    async findOne(id, user) {
        const booking = await this.bookingsService.findOne(id);
        if (user.role === user_role_enum_1.UserRole.CUSTOMER) {
            if (booking.customer_id.toString() !== user.userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        else if (user.role === user_role_enum_1.UserRole.HALL_OWNER) {
            const hall = await this.hallsService.findOne(booking.hall_id.toString());
            if (hall.owner_id?.toString() !== user.userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return booking;
    }
    async adminUpdate(id, body) {
        return this.bookingsService.adminUpdate(id, body);
    }
    async adminDelete(id) {
        return this.bookingsService.adminDelete(id);
    }
    async confirm(id, user) {
        const booking = await this.bookingsService.findOne(id);
        if (user.role === user_role_enum_1.UserRole.HALL_OWNER) {
            const hall = await this.hallsService.findOne(booking.hall_id?._id
                ? booking.hall_id._id.toString()
                : booking.hall_id.toString());
            const ownerId = hall.owner_id?._id
                ? hall.owner_id._id.toString()
                : hall.owner_id?.toString();
            if (ownerId !== user.userId)
                throw new common_1.ForbiddenException('Access denied');
        }
        return this.bookingsService.confirm(id);
    }
    async reject(id, user) {
        const booking = await this.bookingsService.findOne(id);
        if (user.role === user_role_enum_1.UserRole.HALL_OWNER) {
            const hall = await this.hallsService.findOne(booking.hall_id?._id
                ? booking.hall_id._id.toString()
                : booking.hall_id.toString());
            const ownerId = hall.owner_id?._id
                ? hall.owner_id._id.toString()
                : hall.owner_id?.toString();
            if (ownerId !== user.userId)
                throw new common_1.ForbiddenException('Access denied');
        }
        return this.bookingsService.reject(id);
    }
    async cancel(id, user) {
        const booking = await this.bookingsService.findOne(id);
        if (booking.customer_id.toString() !== user.userId) {
            throw new common_1.ForbiddenException('You can only cancel your own bookings');
        }
        if (booking.status !== booking_status_enum_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be cancelled');
        }
        return this.bookingsService.cancel(id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all bookings (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CUSTOMER, user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new booking (customer or admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiOperation)({ summary: 'List current customer bookings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findMyBookings", null);
__decorate([
    (0, common_1.Get)('hall/:hallId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.HALL_OWNER, user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List bookings for a hall' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: booking_status_enum_1.BookingStatus, required: false }),
    __param(0, (0, common_1.Param)('hallId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findByHall", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CUSTOMER, user_role_enum_1.UserRole.HALL_OWNER, user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get single booking by id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin update booking (status, date, guests, price, add-ons)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "adminUpdate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin delete booking' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "adminDelete", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.HALL_OWNER, user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a pending booking' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.HALL_OWNER, user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a booking' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel pending booking (customer)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        halls_service_1.HallsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map