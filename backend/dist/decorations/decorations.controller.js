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
exports.DecorationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const decorations_service_1 = require("./decorations.service");
const create_decoration_dto_1 = require("./dto/create-decoration.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const public_decorator_1 = require("../common/decorators/public.decorator");
let DecorationsController = class DecorationsController {
    constructor(decorationsService) {
        this.decorationsService = decorationsService;
    }
    async findByHall(hallId) {
        return this.decorationsService.findByHall(hallId);
    }
    async create(hallId, dto) {
        return this.decorationsService.create(hallId, dto);
    }
    async update(id, dto) {
        return this.decorationsService.update(id, dto);
    }
    async remove(id) {
        return this.decorationsService.remove(id);
    }
};
exports.DecorationsController = DecorationsController;
__decorate([
    (0, common_1.Get)('halls/:hallId/decorations'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List decorations for a hall (public)' }),
    __param(0, (0, common_1.Param)('hallId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DecorationsController.prototype, "findByHall", null);
__decorate([
    (0, common_1.Post)('halls/:hallId/decorations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create decoration for hall (admin)' }),
    __param(0, (0, common_1.Param)('hallId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_decoration_dto_1.CreateDecorationDto]),
    __metadata("design:returntype", Promise)
], DecorationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('decorations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update decoration (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DecorationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('decorations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete decoration (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DecorationsController.prototype, "remove", null);
exports.DecorationsController = DecorationsController = __decorate([
    (0, swagger_1.ApiTags)('decorations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)({}),
    __metadata("design:paramtypes", [decorations_service_1.DecorationsService])
], DecorationsController);
//# sourceMappingURL=decorations.controller.js.map