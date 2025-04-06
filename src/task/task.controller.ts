import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTaskDto } from './dtos/createTask.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Controller('task')
export class TaskController {
  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {}

  @Post('/createTask')
  @UsePipes(ValidationPipe)
  async createTask(
    @Req() req: Request,
    @Body(new ValidationPipe({ whitelist: true })) createTaskDto: CreateTaskDto,
  ): Promise<{ success: boolean; taskId: number }> {
    type ValidateTokenResponse = { userId: string };

    const authHeader: string | undefined = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    //validate token via auth microservice
    try {
      console.log('sending token for validation to the auth microservice');
      const { userId }: ValidateTokenResponse = await firstValueFrom(
        this.natsClient.send({ cmd: 'validateToken' }, { token: authHeader }),
      );

      const taskData = { ...createTaskDto, userId };

      console.log(
        'Sending task creation event to task microservice :',
        taskData,
      );
      return await firstValueFrom(
        this.natsClient.send({ cmd: 'createTask' }, taskData),
      );
    } catch (error: unknown) {
      console.log('Error during token validation', error);
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
