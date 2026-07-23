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

import { CreateRoleDTO } from '../dtos/create-role.dto';
import { ListRoleDTO } from '../dtos/list-role.dto';
import { RoleResponseDTO } from '../dtos/role-response.dto';
import { UpdateRolePermissionsDTO } from '../dtos/update-role-permissions.dto';
import { UpdateRoleDTO } from '../dtos/update-role.dto';
import { CreateRoleUseCase } from '../use-cases/roles/create-role.use-case';
import { DeleteRoleUseCase } from '../use-cases/roles/delete-role.use-case';
import { FindRoleUseCase } from '../use-cases/roles/find-role.use-case';
import { ListRolesUseCase } from '../use-cases/roles/list-roles.use-case';
import { UpdateRolePermissionsUseCase } from '../use-cases/roles/update-role-permissions.use-case';
import { UpdateRoleUseCase } from '../use-cases/roles/update-role.use-case';

@ApiTags('Roles')
@ApiBearerAuth()
@Roles(ROLE_ADMIN)
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly findRoleUseCase: FindRoleUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  findAll(@Query() query: ListRoleDTO): ReturnType<ListRolesUseCase['execute']> {
    return this.listRolesUseCase.execute(query);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get role by UUID' })
  findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<RoleResponseDTO> {
    return this.findRoleUseCase.execute(uuid);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() dto: CreateRoleDTO): Promise<RoleResponseDTO> {
    return this.createRoleUseCase.execute(dto);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update role' })
  update(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateRoleDTO,
  ): Promise<RoleResponseDTO> {
    return this.updateRoleUseCase.execute(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  remove(@Param('uuid', ParseUuidPipe) uuid: string): Promise<void> {
    return this.deleteRoleUseCase.execute(uuid);
  }

  @Put(':uuid/permissions')
  @ApiOperation({ summary: 'Replace role permissions' })
  updatePermissions(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdateRolePermissionsDTO,
  ): Promise<RoleResponseDTO> {
    return this.updateRolePermissionsUseCase.execute(uuid, dto);
  }
}
