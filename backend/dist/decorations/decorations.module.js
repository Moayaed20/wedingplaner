"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const decoration_schema_1 = require("./schemas/decoration.schema");
const decorations_controller_1 = require("./decorations.controller");
const decorations_service_1 = require("./decorations.service");
let DecorationsModule = class DecorationsModule {
};
exports.DecorationsModule = DecorationsModule;
exports.DecorationsModule = DecorationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: decoration_schema_1.Decoration.name, schema: decoration_schema_1.DecorationSchema },
            ]),
        ],
        controllers: [decorations_controller_1.DecorationsController],
        providers: [decorations_service_1.DecorationsService],
        exports: [decorations_service_1.DecorationsService],
    })
], DecorationsModule);
//# sourceMappingURL=decorations.module.js.map