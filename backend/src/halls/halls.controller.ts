import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { HallsService } from "./halls.service";
import { CreateHallDto } from "./dto/create-hall.dto";
import { FilterHallsDto } from "./dto/filter-halls.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("halls")
@Controller("halls")
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List halls with optional filters (public)" })
  async findAll(@Query() filters: FilterHallsDto) {
    return this.hallsService.findAll(filters);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HALL_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get halls owned by current hall_owner" })
  async findMine(@CurrentUser("userId") userId: string) {
    return this.hallsService.findByOwner(userId);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get hall details (public)" })
  async findOne(@Param("id") id: string) {
    return this.hallsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create hall (admin)" })
  async create(@Body() dto: CreateHallDto) {
    return this.hallsService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HALL_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update hall (admin or hall_owner own hall)" })
  async update(
    @Param("id") id: string,
    @Body() dto: Partial<CreateHallDto>,
    @CurrentUser() user: any,
  ) {
    if (user.role === UserRole.HALL_OWNER) {
      const hall = await this.hallsService.findOne(id);
      if ((hall.owner_id as any).toString() !== user.userId) {
        throw new ForbiddenException("You can only edit your own halls");
      }
    }
    return this.hallsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete hall (admin)" })
  async remove(@Param("id") id: string) {
    return this.hallsService.remove(id);
  }
}
