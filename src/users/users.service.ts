import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async getUsers(): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder(`user`);
    return await query.getMany();
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    //TODO:Error handling
    try {
      return this.userRepository.save(createUserDto);
    } catch (error) {
      console.log(error);
    }
  }

  async findUser(userName: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ userName });
    if (!user) {
      throw new NotFoundException('User is not exist');
    }
    return user;
  }

  async deleteUser(id: string): Promise<string> {
    const res = await this.userRepository.delete({ id });
    if (!res.affected) {
      return 'no such user in db';
    } else {
      return 'user deleted';
    }
  }
}
