import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
            role: import("../common/enums/user-role.enum").UserRole;
        };
    }>;
    me(user: any): Promise<import("../users/schemas/user.schema").User>;
}
