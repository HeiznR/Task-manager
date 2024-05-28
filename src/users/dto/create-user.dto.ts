import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  userName: string;
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password to weak',
  })
  password: string;
}
