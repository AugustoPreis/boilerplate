import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ROLE_ADMIN } from '@shared/constants';
import { Roles } from '@shared/decorators/roles.decorator';
import { ParseUuidPipe } from '@shared/pipes/parse-uuid.pipe';

import { AssignRolesDto } from '../dtos/assign-roles.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserQueryDto } from '../dtos/user-query.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AssignRolesUseCase } from '../use-cases/assign-roles.use-case';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';
import { FindUserUseCase } from '../use-cases/find-user.use-case';
import { ListUsersUseCase } from '../use-cases/list-users.use-case';
import { UpdateUserStatusUseCase } from '../use-cases/update-user-status.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';

@ApiTags('Users')
@ApiBearerAuth()
@Roles(ROLE_ADMIN)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly assignRolesUseCase: AssignRolesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: UserQueryDto): ReturnType<ListUsersUseCase['execute']> {
    return this.listUsersUseCase.execute(query);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get user by UUID' })
  findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<UserResponseDto> {
    return this.findUserUseCase.execute(uuid);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(uuid, dto);
  }

  @Patch(':uuid/status')
  @ApiOperation({ summary: 'Update user status' })
  updateStatus(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.updateUserStatusUseCase.execute(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user' })
  remove(@Param('uuid', ParseUuidPipe) uuid: string): Promise<void> {
    return this.deleteUserUseCase.execute(uuid);
  }

  @Put(':uuid/roles')
  @ApiOperation({ summary: 'Replace user roles' })
  assignRoles(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: AssignRolesDto,
  ): Promise<UserResponseDto> {
    return this.assignRolesUseCase.execute(uuid, dto);
  }
}
