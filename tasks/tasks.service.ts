// src/tasks/tasks.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SearchService } from '../search/search.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private readonly searchService: SearchService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const exists = await this.taskModel.findOne({
      userId,
      title: dto.title,
    });

    if (exists) throw new ConflictException('Duplicate task title');

    const task = await this.taskModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });

    await this.searchService.indexTask(task);

    return task;
  }

  async bulkCreate(userId: string, tasks: CreateTaskDto[]) {
    const userObjectId = new Types.ObjectId(userId);

    const existingTitles = await this.taskModel
      .find({
        userId,
        title: { $in: tasks.map((t) => t.title) },
      })
      .distinct('title');

    const uniqueTasks = tasks.filter((t) => !existingTitles.includes(t.title));

    if (!uniqueTasks.length)
      throw new ConflictException('All tasks are duplicates');

    const createdTasks = await this.taskModel.insertMany(
      uniqueTasks.map((t) => ({ ...t, userId: userObjectId })),
    );

    await Promise.all(createdTasks.map((t) => this.searchService.indexTask(t)));

    return createdTasks;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskModel.findOne({
      _id: taskId,
      userId: new Types.ObjectId(userId),
    });

    if (!task) throw new NotFoundException('Task not found');

    Object.assign(task, dto);
    const updated = await task.save();

    await this.searchService.indexTask(updated); // update index
    return updated;
  }

  async getAll(userId: string) {
    return this.taskModel.find({ userId }).sort({ createdAt: -1 });
  }
}
