import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwtPayload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @Inject(ConfigService) private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: AuthDto): Promise<{ accessToken: string }> {
    const { password, userName } = signUpDto;
    const user = await this.usersRepository.findOneBy({ userName });
    if (user) {
      throw new ConflictException('User already exist');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = bcrypt.hashSync(password, salt);
    const res = await this.usersService.createUser({
      userName,
      password: hashedPassword,
    });
    const payload: JwtPayload = { id: res.id, userName: res.userName };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    return { accessToken };
  }

  async signIn(signInDto: AuthDto): Promise<{ accessToken: string }> {
    const { password, userName } = signInDto;
    const user = await this.usersRepository.findOneBy({ userName });
    if (!user) throw new NotFoundException('user is not exist');

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { userName, id: user.id };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return { accessToken };
    } else {
      throw new UnauthorizedException('Check your credentials');
    }
  }
}
