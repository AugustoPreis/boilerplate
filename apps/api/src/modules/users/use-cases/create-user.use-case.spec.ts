import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HashService } from '@shared/services/hash.service';
import { UuidService } from '@shared/services/uuid.service';

import { UserEntity, UserStatus } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

import { CreateUserUseCase } from './create-user.use-case';

const mockUser = (): UserEntity =>
  ({
    id: 1,
    uuid: 'user-uuid',
    email: 'jane@example.com',
    name: 'Jane Doe',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }) as unknown as UserEntity;

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let usersRepository: jest.Mocked<Pick<UsersRepository, 'findByEmail' | 'create'>>;
  let hashService: jest.Mocked<Pick<HashService, 'hash'>>;
  let uuidService: jest.Mocked<Pick<UuidService, 'generate'>>;

  beforeEach(async () => {
    usersRepository = { findByEmail: jest.fn(), create: jest.fn() };
    hashService = { hash: jest.fn().mockResolvedValue('hashed') };
    uuidService = { generate: jest.fn().mockReturnValue('new-uuid') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: HashService, useValue: hashService },
        { provide: UuidService, useValue: uuidService },
      ],
    }).compile();

    useCase = module.get(CreateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw CONFLICT when email already in use', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser());

    await expect(
      useCase.execute({ email: 'jane@example.com', name: 'Jane Doe', password: 'Abc@1234' }),
    ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
  });

  it('should normalise email to lowercase and create user', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(mockUser());

    const result = await useCase.execute({
      email: 'JANE@EXAMPLE.COM',
      name: 'Jane Doe',
      password: 'Abc@1234',
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jane@example.com' }),
    );
    expect(result.uuid).toBe('user-uuid');
  });
});
