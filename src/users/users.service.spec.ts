import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

const mockUser: User = {
  id: 'testId',
  password: 'testPassword',
  tasks: [],
  userName: 'testUsername',
};
const users: User[] = [];

const mockUsersRepository = () => ({
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis().mockResolvedValue(users),
  })),
  create: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUsersRepository },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });
  describe('Create User', () => {
    it('calls a userService.createUser() should create a new user and return the new user', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testUsername',
        password: 'testPassword',
      };
      const newUser: User = {
        id: 'myTestUserId',
        tasks: [],
        ...createUserDto,
      };
      userRepository.save.mockResolvedValue({
        id: 'myTestUserId',
        tasks: [],
        ...createUserDto,
      });
      const result = await usersService.createUser(createUserDto);
      users.push(result);
      expect(JSON.stringify(result)).toEqual(JSON.stringify(newUser));
    });
  });
  describe('getUsers', () => {
    it('calls a usersService.getUsers and return the result', async () => {
      const result = await usersService.getUsers();
      expect(result.length).toEqual(1);
    });
  });

  describe('getUserById', () => {
    it('calls a userService.getUserById and return a user', async () => {
      await expect(usersService.getUserById('testId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
