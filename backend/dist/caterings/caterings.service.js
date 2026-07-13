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
exports.CateringsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const catering_schema_1 = require("./schemas/catering.schema");
let CateringsService = class CateringsService {
    constructor(cateringModel) {
        this.cateringModel = cateringModel;
    }
    async findByHall(hallId) {
        if (!mongoose_2.Types.ObjectId.isValid(hallId)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        return this.cateringModel.find({ hall_id: new mongoose_2.Types.ObjectId(hallId) }).exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid catering id');
        }
        const item = await this.cateringModel.findById(id).exec();
        if (!item)
            throw new common_1.NotFoundException('Catering not found');
        return item;
    }
    async create(hallId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(hallId)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        const created = new this.cateringModel({
            ...dto,
            hall_id: new mongoose_2.Types.ObjectId(hallId),
        });
        return (await created.save());
    }
    async update(id, dto) {
        const item = await this.cateringModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!item)
            throw new common_1.NotFoundException('Catering not found');
        return item;
    }
    async remove(id) {
        const result = await this.cateringModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('Catering not found');
        return { deleted: true };
    }
};
exports.CateringsService = CateringsService;
exports.CateringsService = CateringsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(catering_schema_1.Catering.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CateringsService);
//# sourceMappingURL=caterings.service.js.map