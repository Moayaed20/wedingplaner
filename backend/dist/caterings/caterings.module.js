"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CateringsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const catering_schema_1 = require("./schemas/catering.schema");
const caterings_controller_1 = require("./caterings.controller");
const caterings_service_1 = require("./caterings.service");
let CateringsModule = class CateringsModule {
};
exports.CateringsModule = CateringsModule;
exports.CateringsModule = CateringsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: catering_schema_1.Catering.name, schema: catering_schema_1.CateringSchema }]),
        ],
        controllers: [caterings_controller_1.CateringsController],
        providers: [caterings_service_1.CateringsService],
        exports: [caterings_service_1.CateringsService],
    })
], CateringsModule);
//# sourceMappingURL=caterings.module.js.map