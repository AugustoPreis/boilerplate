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

import { CurrentUser, RequirePermission } from '@shared/decorators';
import { ParseUuidPipe } from '@shared/pipes/parse-uuid.pipe';

import { AssignRolesDTO } from '../dtos/assign-roles.dto';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserPasswordDTO } from '../dtos/update-user-password.dto';
import { UpdateUserStatusDTO } from '../dtos/update-user-status.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { UserQueryDTO } from '../dtos/user-query.dto';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { AssignRolesUseCase } from '../use-cases/assign-roles.use-case';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';
import { FindUserUseCase } from '../use-cases/find-user.use-case';
import { ListUsersUseCase } from '../use-cases/list-users.use-case';
import { UpdateUserPasswordUseCase } from '../use-cases/update-user-password.use-case';
import { UpdateUserStatusUseCase } from '../use-cases/update-user-status.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';

@ApiTags('Users')
@ApiBearerAuth()
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
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
  ) {}

  @Get()
  @RequirePermission('users', 'read')
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: UserQueryDTO): ReturnType<ListUsersUseCase['execute']> {
    return this.listUsersUseCase.execute(query);
  }

  @Get(':uuid')
  @RequirePermission('users', 'read')
  @ApiOperation({ summary: 'Get user by UUID' })
  findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<UserResponseDTO> {
    return this.findUserUseCase.execute(uuid);
  }

  @Post()
  @RequirePermission('users', 'create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDTO): Promise<UserResponseDTO> {
    return this.createUserUseCase.execute(dto);
  }

  @Patch(':uuid')
  @RequirePermission('users', 'update')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<UserResponseDTO> {
    return this.updateUserUseCase.execute(uuid, dto);
  }

  @Patch(':uuid/status')
  @RequirePermission('users', 'update')
  @ApiOperation({ summary: 'Update user status' })
  updateStatus(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateUserStatusDTO,
  ): Promise<UserResponseDTO> {
    return this.updateUserStatusUseCase.execute(uuid, dto);
  }

  @Delete(':uuid')
  @RequirePermission('users', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user' })
  remove(@Param('uuid', ParseUuidPipe) uuid: string): Promise<void> {
    return this.deleteUserUseCase.execute(uuid);
  }

  @Put(':uuid/roles')
  @RequirePermission('users', 'update')
  @ApiOperation({ summary: 'Replace user roles' })
  assignRoles(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: AssignRolesDTO,
  ): Promise<UserResponseDTO> {
    return this.assignRolesUseCase.execute(uuid, dto);
  }

  // No @RequirePermission: any authenticated user may change their own password.
  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user password' })
  updatePassword(
    @CurrentUser('uuid') uuid: string,
    @Body() dto: UpdateUserPasswordDTO,
  ): Promise<void> {
    return this.updateUserPasswordUseCase.execute(uuid, dto);
  }
}
