import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "../common/enums/user-role.enum";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        user: import("../users/schemas/user.schema").User;
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: UserRole;
        };
    }>;
    me(userId: string): Promise<import("../users/schemas/user.schema").User>;
}
