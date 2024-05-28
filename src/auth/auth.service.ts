import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/signUp.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
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
    const token = this.jwtService.sign({ id: res.id }, { secret: 'test123' });
    return { token };
  }
}
