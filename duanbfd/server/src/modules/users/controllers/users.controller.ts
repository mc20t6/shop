import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';

import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // QUẢN LÝ CHUNG: STAFF + CUSTOMER
  // =========================

  @Get()
  findAllUsers(@Query() query: any) {
    return this.usersService.findAllManagedUsers(query);
  }

  @Get(':id')
  findManagedUserById(@Param('id') id: string) {
    return this.usersService.findManagedUserById(id);
  }

  @Patch(':id/toggle-status')
  toggleManagedUserStatus(@Param('id') id: string) {
    return this.usersService.toggleManagedUserStatus(id);
  }

  @Delete(':id')
  deleteManagedUser(@Param('id') id: string) {
    return this.usersService.deleteManagedUser(id);
  }

  // =========================
  // QUẢN LÝ RIÊNG NHÂN VIÊN
  // =========================

  @Post('staff')
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.usersService.createStaff(createStaffDto);
  }

  @Get('staff/:id')
  findStaffById(@Param('id') id: string) {
    return this.usersService.findStaffById(id);
  }

  @Patch('staff/:id')
  updateStaff(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.usersService.updateStaff(id, updateStaffDto);
  }

  @Delete('staff/:id')
  deleteStaff(@Param('id') id: string) {
    return this.usersService.deleteStaff(id);
  }
}
