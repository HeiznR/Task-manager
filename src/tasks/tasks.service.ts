import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.status.enum';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: FilterTaskDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });

    if (status && search) {
      query.andWhere(
        `(task.status=:status AND (LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)))`,
        { status, search: `%${search}%` },
      );
    } else if (status) {
      query.andWhere(`(task.status=:status)`, { status });
    } else if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const resp = await query.getMany();
    return resp;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const response = await this.tasksRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!response) {
      throw new NotFoundException(`Task with id: ${id} is not found`);
    }
    return response;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description, status } = createTaskDto;
    const task: Task = this.tasksRepository.create({
      id: uuid(),
      title,
      description,
      status,
      user,
    });
    const response = await this.tasksRepository.save(task);
    return response;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const response = await this.tasksRepository.delete({
      id,
      user: { id: user.id },
    });
    if (!response.affected) {
      throw new NotFoundException(`Task with id: ${id} is not exist`);
    }
  }

  async updateTask(id: string, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.tasksRepository.save(task);
    return task;
  }
}
