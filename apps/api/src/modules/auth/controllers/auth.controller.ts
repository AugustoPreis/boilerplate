import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';

import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { SkipCsrf } from '@shared/decorators/skip-csrf.decorator';
import { AppException } from '@shared/exceptions';
import { UuidService } from '@shared/services/uuid.service';

import { LoginDto } from '../dtos/login.dto';
import { MeResponseDto } from '../dtos/me-response.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { GetMeUseCase } from '../use-cases/get-me.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from '../utils/auth-cookies.util';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly config: ConfigService,
    private readonly uuidService: UuidService,
  ) {}

  @Post('login')
  @Public()
  @SkipCsrf()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() _dto: LoginDto,
    @CurrentUser() user: IAuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: MeResponseDto }> {
    const result = await this.loginUseCase.execute(user);

    setAuthCookies(res, this.config, result, this.uuidService.generate('v4'));

    return { user: result.user };
  }

  @Post('refresh')
  @Public()
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using the refresh_token cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: MeResponseDto }> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_TOKEN_COOKIE
    ];

    if (!refreshToken) {
      throw AppException.from('auth.REFRESH_TOKEN_NOT_FOUND', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    setAuthCookies(res, this.config, result, this.uuidService.generate('v4'));

    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the refresh token and clear session cookies' })
  async logout(
    @CurrentUser() user: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logoutUseCase.execute(user.sub);
    clearAuthCookies(res, this.config);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: IJwtPayload): Promise<MeResponseDto> {
    return this.getMeUseCase.execute(user.sub);
  }
}
