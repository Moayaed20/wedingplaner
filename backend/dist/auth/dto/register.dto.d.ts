import { UserRole } from '../../common/enums/user-role.enum';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
}
