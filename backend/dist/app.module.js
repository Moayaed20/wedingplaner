"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const auth_middleware_1 = require("./common/middleware/auth.middleware");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const halls_module_1 = require("./halls/halls.module");
const caterings_module_1 = require("./caterings/caterings.module");
const decorations_module_1 = require("./decorations/decorations.module");
const cars_module_1 = require("./cars/cars.module");
const music_module_1 = require("./music/music.module");
const services_module_1 = require("./services/services.module");
const bookings_module_1 = require("./bookings/bookings.module");
const reviews_module_1 = require("./reviews/reviews.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            halls_module_1.HallsModule,
            caterings_module_1.CateringsModule,
            decorations_module_1.DecorationsModule,
            cars_module_1.CarsModule,
            music_module_1.MusicModule,
            services_module_1.ServicesModule,
            bookings_module_1.BookingsModule,
            reviews_module_1.ReviewsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            auth_middleware_1.AuthMiddleware,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map