import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@shared/shared.module';

import { RoleEntity } from '@modules/roles/entities/role.entity';

import { UsersController } from './controllers/users.controller';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { AssignRolesUseCase } from './use-cases/assign-roles.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { FindUserUseCase } from './use-cases/find-user.use-case';
import { ListUsersUseCase } from './use-cases/list-users.use-case';
import { UpdateUserPasswordUseCase } from './use-cases/update-user-password.use-case';
import { UpdateUserStatusUseCase } from './use-cases/update-user-status.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([UserEntity, UserRoleEntity, RoleEntity])],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    ListUsersUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserStatusUseCase,
    DeleteUserUseCase,
    AssignRolesUseCase,
    UpdateUserPasswordUseCase,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
