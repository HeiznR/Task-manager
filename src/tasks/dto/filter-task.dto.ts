import { TaskStatus } from '../task.model';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class FilterTaskDto {
  @IsOptional()
  @IsNotEmpty()
  search?: string;
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: string;
}
