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
exports.CateringSchema = exports.Catering = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hall_status_enum_1 = require("../../common/enums/hall-status.enum");
let Catering = class Catering {
};
exports.Catering = Catering;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Hall', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Catering.prototype, "hall_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catering.prototype, "menu_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Catering.prototype, "price_per_person", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catering.prototype, "menu_type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Catering.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: hall_status_enum_1.HallStatus, default: hall_status_enum_1.HallStatus.ACTIVE }),
    __metadata("design:type", String)
], Catering.prototype, "status", void 0);
exports.Catering = Catering = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'hall_caterings' })
], Catering);
exports.CateringSchema = mongoose_1.SchemaFactory.createForClass(Catering);
//# sourceMappingURL=catering.schema.js.map