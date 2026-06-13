import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, UserRole } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Types } from 'mongoose';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  // REGISTER
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.trim();
    const fullName = dto.fullName.trim();

    const existingUser = await this.userRepository.findByEmailOrPhone(
      email,
      phone,
    );
    if (existingUser) {
      throw new ConflictException('Email hoặc số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.userRepository.create({
      email,
      phone,
      fullName,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    return {
      message: 'Đăng ký tài khoản thành công',
      user: this.toAuthUser(user),
    };
  }

  // LOGIN
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const tokens = await this.signTokens(this.toAuthUser(user));

    await this.userRepository.updateById(user._id.toString(), {
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      tokenType: 'Bearer',
      user: this.toAuthUser(user),
    };
  }

  // LOGOUT
  async logout(userId: string): Promise<{ message: string }> {
    try {
      console.log('Service nhận được userId để logout là:', userId);
      const objectId = new Types.ObjectId(userId);

      const result = await this.userRepository.updateById(objectId.toString(), {
        refreshToken: null,
      });

      return { message: 'Đăng xuất thành công!' };
    } catch (error) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã đăng xuất trước đó',
      );
    }
  }

  // 1. HÀM FORGOT PASSWORD
  async forgotPassword(
    emailDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const email = emailDto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`====================================`);
    console.log(`FORGOT PASSWORD REQUEST FOR: ${email}`);
    console.log(`GENERATED OTP: ${otp}`);

    if (!user) {
      console.log(`No user found for email: ${email}. OTP not saved.`);
      console.log(`====================================`);
      return {
        message:
          'Mã xác thực khôi phục mật khẩu đã được gửi đến email của bạn!',
      };
    }

    console.log(`User found. Saving OTP for: ${email}`);
    console.log(`====================================`);

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    await this.userRepository.updateById(user._id.toString(), {
      passwordResetToken: otp,
      passwordResetExpires: expires,
    });

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Yêu cầu khôi phục mật khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Khôi phục mật khẩu</h2>
            <p>Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản <strong>${user.email}</strong>.</p>
            <p>Mã OTP của bạn là:</p>
            <p style="font-size: 24px; font-weight: bold;">${otp}</p>
            <p>Mã này có hiệu lực trong 10 phút.</p>
            <p>Nếu bạn không yêu cầu thay đổi mật khẩu, hãy bỏ qua email này.</p>
          </div>
        `,
      });
    } catch (sendError) {
      console.warn('MailerService sendMail failed:', sendError);
    }

    return {
      message: 'Mã xác thực khôi phục mật khẩu đã được gửi đến email của bạn!',
    };
  }

  //  HÀM RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Dùng lại userRepository để tìm kiếm theo OTP
    const user = await this.userRepository.findOne({
      passwordResetToken: dto.otp,
    });

    if (!user) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn!');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      await this.userRepository.updateById(user._id.toString(), {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      });
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Dùng user._id.toString() để xóa OTP sau khi đổi pass thành công
    await this.userRepository.updateById(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      refreshToken: undefined,
    });

    return { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' };
  }

  private async signTokens(user: AuthUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('REFRESH_SECRET') || 'refresh_secret',
        expiresIn: (this.configService.get<string>('REFRESH_EXPIRES_IN') ||
          '30d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findByIdUser(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return this.toAuthUser(user);
  }

  private toAuthUser(user: any): AuthUser {
    return {
      id: user.id || user._id?.toString(),
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    };
  }
}

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
};
