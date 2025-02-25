import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dtos/createTask.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('task')
export class TaskController {
  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {}

  @Post('/createTask')
  async createTask(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    //validate token via auth microservice
    try {
      console.log('sending token for validation to the auth microservice');
      const { userId } = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'validateToken' },
          { token: authHeader },
        ),
      );

      const taskData = { ...createTaskDto, userId };

      console.log(
        'sending task creation event to task microservice :',
        taskData,
      );
      return this.natsClient.send({ cmd: 'createTask' }, taskData);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
