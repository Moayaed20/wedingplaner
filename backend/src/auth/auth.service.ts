import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "../common/enums/user-role.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role ?? UserRole.CUSTOMER;
    const user = await this.usersService.create({ ...dto, role });
    return {
      success: true,
      message: "User registered successfully",
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const storedPassword = user.password;
    const isLegacyPlainTextPassword = storedPassword === dto.password;
    const match = await bcrypt
      .compare(dto.password, storedPassword)
      .catch(() => false);

    if (!match && !isLegacyPlainTextPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (isLegacyPlainTextPassword) {
      await this.usersService.updatePassword(
        user._id.toString(),
        await bcrypt.hash(dto.password, 10),
      );
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }
}
