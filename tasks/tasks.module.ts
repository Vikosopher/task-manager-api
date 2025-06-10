// src/tasks/tasks.module.ts

import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    SearchModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
