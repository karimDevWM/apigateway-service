import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignInUserDto {
  @IsStrongPassword({
    minLength: 10,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
