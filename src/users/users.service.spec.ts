import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

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
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUsersRepository },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getUsers', () => {
    it('calls a usersService.getUsers and return the result', async () => {
      const result = await usersService.getUsers();
      expect(result.length).toEqual(0);
    });
  });
});
