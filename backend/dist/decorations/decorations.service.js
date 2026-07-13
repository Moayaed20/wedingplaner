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
exports.DecorationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const decoration_schema_1 = require("./schemas/decoration.schema");
let DecorationsService = class DecorationsService {
    constructor(decorationModel) {
        this.decorationModel = decorationModel;
    }
    async findByHall(hallId) {
        if (!mongoose_2.Types.ObjectId.isValid(hallId)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        return this.decorationModel
            .find({ hall_id: new mongoose_2.Types.ObjectId(hallId) })
            .exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid decoration id');
        }
        const item = await this.decorationModel.findById(id).exec();
        if (!item)
            throw new common_1.NotFoundException('Decoration not found');
        return item;
    }
    async create(hallId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(hallId)) {
            throw new common_1.BadRequestException('Invalid hall id');
        }
        const created = new this.decorationModel({
            ...dto,
            hall_id: new mongoose_2.Types.ObjectId(hallId),
        });
        return (await created.save());
    }
    async update(id, dto) {
        const item = await this.decorationModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!item)
            throw new common_1.NotFoundException('Decoration not found');
        return item;
    }
    async remove(id) {
        const result = await this.decorationModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('Decoration not found');
        return { deleted: true };
    }
};
exports.DecorationsService = DecorationsService;
exports.DecorationsService = DecorationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(decoration_schema_1.Decoration.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DecorationsService);
//# sourceMappingURL=decorations.service.js.map