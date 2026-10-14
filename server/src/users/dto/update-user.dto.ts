import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @MaxLength(30, {
    message: 'Username cannot exceed 30 characters',
  })
  username: string;
}
