import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskRepository } from './repositories/task.repository';

@Module({
  imports: [PrismaModule],
  providers: [TaskRepository],
  exports: [TaskRepository],
})
export class TasksModule {}
