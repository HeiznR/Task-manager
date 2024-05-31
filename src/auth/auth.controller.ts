import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  signUp(@Body() signUpDto: AuthDto): Promise<{ accessToken: string }> {
    return this.authService.signUp(signUpDto);
  }
  @Post('/signin')
  signIn(@Body() signInDto: AuthDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }
}
