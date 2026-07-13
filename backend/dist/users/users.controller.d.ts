import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./schemas/user.schema").User[]>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    create(dto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    update(id: string, dto: Partial<CreateUserDto>): Promise<import("./schemas/user.schema").User>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
