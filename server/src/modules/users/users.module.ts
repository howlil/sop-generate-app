import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { JabatanController } from './controller/jabatan.controller';
import { UserService } from './service/user.service';
import { JabatanService } from './service/jabatan.service';
import { UserRepository } from './repository/user.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, JabatanController],
  providers: [
    UserService,
    JabatanService,
    UserRepository,
    PrismaService,
  ],
  exports: [UserService, JabatanService, UserRepository],
})
export class UsersModule {}
