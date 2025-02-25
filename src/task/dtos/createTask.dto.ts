import { IsString } from 'class-validator';
// import dayjs from 'dayjs';

export class CreateTaskDto {
  @IsString()
  name: string;
}
