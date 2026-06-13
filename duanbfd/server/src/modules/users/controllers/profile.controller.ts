import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { imageUploadOptions } from '../../../common/upload/image-upload.util';
import { ChangePasswordDto } from '../dto/change-password.dto';

type RequestWithUser = Request & {
  user: {
    id?: string;
    userId?: string;
    sub?: string;
  };
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() body: { name?: string; phone?: string; fullName?: string },
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }

    const fullNameToUpdate = body.fullName || body.name;

    return this.usersService.updateProfile(userId, {
      fullName: fullNameToUpdate,
      phone: body.phone,
    });
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', imageUploadOptions('users')))
  updateMyAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh avatar');
    }

    const userId = req.user.id || req.user.userId || req.user.sub;

    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }

    const avatar = `/uploads/users/${file.filename}`;

    return this.usersService.updateAvatar(userId, avatar);
  }

  @Patch('change-password')
  changePassword(
    @Req() req: RequestWithUser,
    @Body() body: ChangePasswordDto,
  ) {
    const userId = req.user.id || req.user.userId || req.user.sub;
    if (!userId) {
      throw new BadRequestException('Không lấy được thông tin người dùng');
    }

    return this.usersService.changePassword(userId, body);
  }
}
