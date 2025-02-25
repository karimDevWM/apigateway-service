import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dtos/createUser.dto';
import { SignInUserDto } from './dtos/signInUser.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {}

  @Post('/signup')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('received info from user to signup : ', createUserDto);
    return this.natsClient.send({ cmd: 'createUser' }, createUserDto);
  }

  @Post('/signin')
  login(@Body() signInUserDto: SignInUserDto) {
    console.log('received info from user to signin : ', signInUserDto);
    return this.natsClient.send({ cmd: 'loginUser' }, signInUserDto);
  }
}
