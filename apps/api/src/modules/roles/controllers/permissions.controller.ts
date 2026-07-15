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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ROLE_ADMIN } from '@shared/constants';
import { Roles } from '@shared/decorators/roles.decorator';
import { PaginationQueryDTO } from '@shared/dtos/pagination-query.dto';
import { ParseUuidPipe } from '@shared/pipes/parse-uuid.pipe';

import { CreatePermissionDTO } from '../dtos/create-permission.dto';
import { PermissionResponseDTO } from '../dtos/permission-response.dto';
import { UpdatePermissionDTO } from '../dtos/update-permission.dto';
import { CreatePermissionUseCase } from '../use-cases/permissions/create-permission.use-case';
import { DeletePermissionUseCase } from '../use-cases/permissions/delete-permission.use-case';
import { FindPermissionUseCase } from '../use-cases/permissions/find-permission.use-case';
import { ListPermissionsUseCase } from '../use-cases/permissions/list-permissions.use-case';
import { UpdatePermissionUseCase } from '../use-cases/permissions/update-permission.use-case';

@ApiTags('Permissions')
@ApiBearerAuth()
@Roles(ROLE_ADMIN)
@Controller({ path: 'permissions', version: '1' })
export class PermissionsController {
  constructor(
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly findPermissionUseCase: FindPermissionUseCase,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List permissions' })
  findAll(@Query() query: PaginationQueryDTO): ReturnType<ListPermissionsUseCase['execute']> {
    return this.listPermissionsUseCase.execute(query.page, query.perPage);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get permission by UUID' })
  findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<PermissionResponseDTO> {
    return this.findPermissionUseCase.execute(uuid);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  create(@Body() dto: CreatePermissionDTO): Promise<PermissionResponseDTO> {
    return this.createPermissionUseCase.execute(dto);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update permission' })
  update(
    @Param('uuid', ParseUuidPipe) uuid: string,
    @Body() dto: UpdatePermissionDTO,
  ): Promise<PermissionResponseDTO> {
    return this.updatePermissionUseCase.execute(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  remove(@Param('uuid', ParseUuidPipe) uuid: string): Promise<void> {
    return this.deletePermissionUseCase.execute(uuid);
  }
}
