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
exports.CateringsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const caterings_service_1 = require("./caterings.service");
const create_catering_dto_1 = require("./dto/create-catering.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let CateringsController = class CateringsController {
    constructor(cateringsService) {
        this.cateringsService = cateringsService;
    }
    async findByHall(hallId) {
        return this.cateringsService.findByHall(hallId);
    }
    async create(hallId, dto) {
        return this.cateringsService.create(hallId, dto);
    }
    async update(id, dto) {
        return this.cateringsService.update(id, dto);
    }
    async remove(id) {
        return this.cateringsService.remove(id);
    }
};
exports.CateringsController = CateringsController;
__decorate([
    (0, common_1.Get)('halls/:hallId/caterings'),
    (0, swagger_1.ApiOperation)({ summary: 'List caterings for a hall (public)' }),
    __param(0, (0, common_1.Param)('hallId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CateringsController.prototype, "findByHall", null);
__decorate([
    (0, common_1.Post)('halls/:hallId/caterings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create catering for hall (admin)' }),
    __param(0, (0, common_1.Param)('hallId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_catering_dto_1.CreateCateringDto]),
    __metadata("design:returntype", Promise)
], CateringsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('caterings/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update catering (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CateringsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('caterings/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete catering (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CateringsController.prototype, "remove", null);
exports.CateringsController = CateringsController = __decorate([
    (0, swagger_1.ApiTags)('caterings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)({}),
    __metadata("design:paramtypes", [caterings_service_1.CateringsService])
], CateringsController);
//# sourceMappingURL=caterings.controller.js.map