import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.status.enum';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: FilterTaskDto): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');

    if (status && search) {
      query.andWhere(
        `task.status=:status AND (LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))`,
        { status, search: `%${search}%` },
      );
    } else if (status) {
      query.andWhere(`task.status=:status`, { status });
    } else if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    const resp = await query.getMany();
    return resp;
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await this.tasksRepository.findOneBy({ id });
    if (!response) {
      throw new NotFoundException(`Task with id: ${id} is not found`);
    }
    return response;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, status } = createTaskDto;
    const task: Task = this.tasksRepository.create({
      id: uuid(),
      title,
      description,
      status,
    });
    const response = await this.tasksRepository.save(task);
    return response;
  }

  async deleteTask(id: string): Promise<void> {
    const response = await this.tasksRepository.delete(id);
    if (!response.affected) {
      throw new NotFoundException(`Task with id: ${id} is not exist`);
    }
  }

  async updateTask(id: string, status: TaskStatus): Promise<Task> {
    const response = await this.tasksRepository.update({ id }, { status });
    console.log(response);
    return this.getTaskById(id);
  }
}
