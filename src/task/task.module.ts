import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  imports: [NatsClientModule],
  controllers: [TaskController],
  providers: [],
})
export class TaskModule {}
