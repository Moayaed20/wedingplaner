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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findAll() {
        return this.userModel.find().select("-password").exec();
    }
    async findOne(id) {
        const user = await this.userModel.findById(id).select("-password").exec();
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        return this.userModel.findOne({ email: normalizedEmail }).exec();
    }
    async create(dto) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        const existing = await this.findByEmail(normalizedEmail);
        if (existing)
            throw new common_1.ConflictException("Email already registered");
        const hashed = await bcrypt.hash(dto.password, 10);
        const created = new this.userModel({
            ...dto,
            email: normalizedEmail,
            password: hashed,
        });
        return (await created.save());
    }
    async updatePassword(id, password) {
        await this.userModel.findByIdAndUpdate(id, { password }).exec();
    }
    async ensureDemoUsers() {
        const demoUsers = [
            {
                name: "Admin User",
                email: "admin@example.com",
                password: "admin123",
                role: user_role_enum_1.UserRole.ADMIN,
            },
            {
                name: "Hall Owner",
                email: "owner@example.com",
                password: "owner123",
                role: user_role_enum_1.UserRole.HALL_OWNER,
            },
            {
                name: "Alice Customer",
                email: "alice@example.com",
                password: "alice123",
                role: user_role_enum_1.UserRole.CUSTOMER,
            },
        ];
        for (const demoUser of demoUsers) {
            const existing = await this.userModel
                .findOne({ email: demoUser.email.toLowerCase().trim() })
                .exec();
            if (!existing) {
                const hashed = await bcrypt.hash(demoUser.password, 10);
                await this.userModel.create({
                    ...demoUser,
                    email: demoUser.email.toLowerCase().trim(),
                    password: hashed,
                });
                continue;
            }
            const passwordMatches = await bcrypt
                .compare(demoUser.password, existing.password)
                .catch(() => false);
            if (!passwordMatches) {
                existing.password = await bcrypt.hash(demoUser.password, 10);
                existing.role = demoUser.role;
                await existing.save();
            }
        }
    }
    async update(id, dto) {
        const update = { ...dto };
        if (dto.password) {
            update.password = await bcrypt.hash(dto.password, 10);
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, update, { new: true })
            .select("-password")
            .exec();
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    async remove(id) {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException("User not found");
        return { deleted: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map