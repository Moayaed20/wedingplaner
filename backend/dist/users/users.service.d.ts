import { Model } from "mongoose";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<User>;
    updatePassword(id: string, password: string): Promise<void>;
    ensureDemoUsers(): Promise<void>;
    update(id: string, dto: Partial<CreateUserDto>): Promise<User>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
