import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

// --- TỰ ĐỊNH NGHĨA DECORATOR MATCH ĐỂ SO SÁNH KHỚP MẬT KHẨU ---
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mã OTP gồm 6 chữ số được gửi qua Email',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi ký tự số' })
  @Length(6, 6, { message: 'Mã OTP phải chính xác là 6 chữ số' })
  otp!: string;

  @ApiProperty({
    description: 'Mật khẩu mới muốn thay đổi',
    example: 'NewPassword123@',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' })
  newPassword!: string;

  @ApiProperty({
    description: 'Nhập lại mật khẩu mới để xác nhận',
    example: 'NewPassword123@',
  })
  @IsNotEmpty({ message: 'Mật khẩu xác nhận không được để trống' })
  @IsString({ message: 'Mật khẩu xác nhận phải là chuỗi ký tự' })
  @Match('newPassword', {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
  })
  confirmPassword!: string;
}
