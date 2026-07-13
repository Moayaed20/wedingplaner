import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRole } from "../common/enums/user-role.enum";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().select("-password").exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select("-password").exec();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.userModel.findOne({ email: normalizedEmail }).exec();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) throw new ConflictException("Email already registered");

    const hashed = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({
      ...dto,
      email: normalizedEmail,
      password: hashed,
    });
    return (await created.save()) as unknown as User;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { password }).exec();
  }

  async ensureDemoUsers(): Promise<void> {
    const demoUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: UserRole.ADMIN,
      },
      {
        name: "Hall Owner",
        email: "owner@example.com",
        password: "owner123",
        role: UserRole.HALL_OWNER,
      },
      {
        name: "Alice Customer",
        email: "alice@example.com",
        password: "alice123",
        role: UserRole.CUSTOMER,
      },
    ];

    for (const demoUser of demoUsers) {
      const existing = await this.userModel
        .findOne({ email: demoUser.email.toLowerCase().trim() })
        .exec();

      if (!existing) {
        const hashed = await bcrypt.hash(demoUser.password, 10);
        await this.userModel.create({
          ...demoUser,
          email: demoUser.email.toLowerCase().trim(),
          password: hashed,
        });
        continue;
      }

      const passwordMatches = await bcrypt
        .compare(demoUser.password, existing.password)
        .catch(() => false);
      if (!passwordMatches) {
        existing.password = await bcrypt.hash(demoUser.password, 10);
        existing.role = demoUser.role;
        await existing.save();
      }
    }
  }

  async update(id: string, dto: Partial<CreateUserDto>): Promise<User> {
    const update: any = { ...dto };
    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select("-password")
      .exec();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("User not found");
    return { deleted: true };
  }
}
