import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(30, {
    message: 'Username cannot exceed 30 characters',
  })
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254, {
    message: 'Email cannot exceed 254 characters',
  })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  @MaxLength(72, {
    message: 'Password cannot exceed 72 characters',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}
