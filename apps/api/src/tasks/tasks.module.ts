import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LifeMissionModule } from "../life-mission/life-mission.module";
import { TaskRepository } from "./repositories/task.repository";
import { TasksService } from "./services/tasks.service";
import { TasksController } from "./controllers/tasks.controller";

@Module({
  imports: [PrismaModule, LifeMissionModule],
  controllers: [TasksController],
  providers: [TaskRepository, TasksService],
  exports: [TaskRepository, TasksService],
})
export class TasksModule {}
