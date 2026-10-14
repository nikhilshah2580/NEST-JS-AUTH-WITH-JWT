import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  @MaxLength(254, {
    message: 'Email cannot exceed 254 characters',
  })
  email: string;

  @IsString({
    message: 'Password must be a string',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  @MaxLength(72, {
    message: 'Password cannot exceed 72 characters',
  })
  password: string;
}
