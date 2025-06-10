// src/tasks/tasks.controller.ts

import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SearchService } from '../search/search.service';

@UseGuards(AccessTokenGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly taskService: TasksService,
    private readonly searchService: SearchService,
  ) {}

  @Post()
  createTask(@GetUser() user: any, @Body() dto: CreateTaskDto) {
    return this.taskService.create(user.sub, dto);
  }

  @Post('bulk')
  createTasksBulk(@GetUser() user: any, @Body() tasks: CreateTaskDto[]) {
    return this.taskService.bulkCreate(user.sub, tasks);
  }

  @Patch(':id')
  updateTask(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(user.sub, id, dto);
  }

  @Get()
  getAllTasks(@GetUser() user: any) {
    return this.taskService.getAll(user.sub);
  }

  @Get('search')
  searchTasks(
    @GetUser() user: any,
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.searchService.search(user.sub, q, +page, +limit);
  }
}
