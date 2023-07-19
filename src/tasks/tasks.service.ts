import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }
  getTasksWithFiltering(filterDto: FilterTaskDto): Task[] {
    const { status, search } = filterDto;
    let tasks2: Task[] = [...this.tasks];
    if (status) {
      tasks2 = tasks2.filter((task) => task.status === status);
    }
    if (search) {
      tasks2 = tasks2.filter((task) => task.title.includes(search));
    }

    return tasks2;
  }

  getTaskById(id: string): Task {
    const found = this.tasks.find((task) => task.id === id);
    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description, status } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: status,
    };
    this.tasks.push(task);
    return task;
  }

  deleteTask(id: string): void {
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter((task) => task.id !== found.id);
  }
  updateTask(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
