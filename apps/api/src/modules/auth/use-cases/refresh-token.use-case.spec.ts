import { createHash } from 'crypto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { REDIS_CLIENT } from '@core/redis/redis.constants';

import { AppException } from '@shared/exceptions';

import { UserEntity, UserStatus } from '../../users/entities/user.entity';
import { UsersRepository } from '../../users/repositories/users.repository';

import { LoginUseCase } from './login.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';

const FAKE_TOKEN = 'fake.refresh.token';
const FAKE_HASH = createHash('sha256').update(FAKE_TOKEN).digest('hex');
const USER_UUID = '550e8400-e29b-41d4-a716-446655440001';

const mockUser = (): UserEntity =>
  ({
    id: 1,
    uuid: USER_UUID,
    email: 'admin@boilerplate.local',
    name: 'Admin',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    userRoles: [{ role: { name: 'admin' } }],
  }) as unknown as UserEntity;

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let jwtService: jest.Mocked<JwtService>;
  let usersRepository: jest.Mocked<Pick<UsersRepository, 'findByUuid'>>;
  let redis: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let loginUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    redis = {
      get: jest.fn().mockResolvedValue(FAKE_HASH),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: JwtService,
          useValue: { verify: jest.fn().mockReturnValue({ sub: USER_UUID }) },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const map: Record<string, unknown> = { 'auth.jwtRefreshSecret': 'refresh-secret' };
              return map[key] ?? fallback;
            }),
          },
        },
        {
          provide: UsersRepository,
          useValue: { findByUuid: jest.fn().mockResolvedValue(mockUser()) },
        },
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              accessToken: 'new-token',
              refreshToken: 'new-refresh',
              accessExpiresInSeconds: 900,
              refreshExpiresInSeconds: 604800,
              user: { uuid: USER_UUID },
            }),
          },
        },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    useCase = module.get(RefreshTokenUseCase);
    jwtService = module.get(JwtService);
    usersRepository = module.get(UsersRepository);
    loginUseCase = module.get(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return new tokens when refresh token is valid', async () => {
    const result = await useCase.execute(FAKE_TOKEN);

    expect(result.accessToken).toBe('new-token');
    expect(loginUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ uuid: USER_UUID }));
  });

  it('should throw when JWT verification fails', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('expired');
    });

    await expect(useCase.execute('bad-token')).rejects.toThrow(AppException);
  });

  it('should throw when Redis has no stored hash', async () => {
    redis.get.mockResolvedValue(null);

    await expect(useCase.execute(FAKE_TOKEN)).rejects.toThrow(AppException);
  });

  it('should throw when hash does not match', async () => {
    redis.get.mockResolvedValue('wrong-hash');

    await expect(useCase.execute(FAKE_TOKEN)).rejects.toThrow(AppException);
  });

  it('should throw when user is not ACTIVE', async () => {
    usersRepository.findByUuid.mockResolvedValue({
      ...mockUser(),
      status: UserStatus.INACTIVE,
    });

    await expect(useCase.execute(FAKE_TOKEN)).rejects.toThrow(AppException);
  });
});
