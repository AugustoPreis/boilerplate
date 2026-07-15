import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { REDIS_CLIENT } from '@core/redis/redis.constants';

import { IAuthUser } from '../interfaces/auth-user.interface';

import { LoginUseCase } from './login.use-case';

const mockUser: IAuthUser = {
  id: 1,
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  email: 'admin@boilerplate.local',
  name: 'Admin',
  avatarUrl: null,
  status: 'active',
  roles: ['admin'],
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let jwtService: { sign: jest.Mock };
  let redis: { set: jest.Mock; get: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    redis = { set: jest.fn().mockResolvedValue('OK'), get: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const map: Record<string, unknown> = {
                'auth.jwtSecret': 'secret',
                'auth.jwtRefreshSecret': 'refresh-secret',
                'auth.jwtExpiresIn': '15m',
                'auth.jwtRefreshExpiresIn': '7d',
              };
              return map[key] ?? fallback;
            }),
          },
        },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return access and refresh tokens with the authenticated user', async () => {
    const result = await useCase.execute(mockUser);

    expect(result.accessToken).toBe('signed-token');
    expect(result.refreshToken).toBe('signed-token');
    expect(result.accessExpiresInSeconds).toBe(15 * 60);
    expect(result.user).toEqual(
      expect.objectContaining({ uuid: mockUser.uuid, email: mockUser.email }),
    );
  });

  it('should sign access token with user payload', async () => {
    await useCase.execute(mockUser);

    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: mockUser.uuid, email: mockUser.email, roles: mockUser.roles },
      expect.objectContaining({ secret: 'secret' }),
    );
  });

  it('should store refresh token hash in Redis', async () => {
    await useCase.execute(mockUser);

    expect(redis.set).toHaveBeenCalledWith(
      `auth:refresh:${mockUser.uuid}`,
      expect.any(String),
      'EX',
      expect.any(Number),
    );
  });
});
