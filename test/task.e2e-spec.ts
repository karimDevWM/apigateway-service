import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { NatsClientModule } from '../src/nats-client/nats-client.module';
import { ClientProxy } from '@nestjs/microservices';
import { App } from 'supertest/types';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let natsClient: NatsClientModule;

  beforeAll(async () => {
    const modelFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modelFixture.createNestApplication();

    // Enable Validation Pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Get NATS Client
    natsClient = app.get<ClientProxy>('NATS_SERVICE');

    type Command = { cmd: string };
    type StringPayload = { token: string };

    // Mock validateToken response (User ID from Auth Microservice)
    jest
      .spyOn(natsClient as ClientProxy, 'send')
      .mockImplementation((cmd: Command, payload: StringPayload) => {
        if (cmd.cmd === 'validateToken') {
          if (payload.token === 'valid-token') {
            return of({ userId: 'dfgdg89' });
          }
          return throwError(() => new UnauthorizedException('Invalid token'));
        }

        if (cmd.cmd === 'createTask') {
          return of({ success: true, taskId: 101 });
        }

        return of({});
      });

    await app.startAllMicroservices();
    // Enable Validation Pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Test case: Task creation with valid token
  it('createTask (POST) - should create task successfully', async () => {
    const response = await request(app.getHttpServer() as App)
      .post('/task/createTask')
      .set('Authorization', 'valid-token') // Valid token
      .send({ name: 'test' })
      .expect(201);

    expect(response.body).toEqual({ success: true, taskId: 101 });
  });

  // Test case: Missing Authorization header
  it('task/createTask (POST) - should return 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer() as App)
      .post('/task/createTask')
      .send({ name: 'test' })
      .expect(401);

    expect((response.body as { message: string }).message).toEqual(
      'No token provided',
    );
  });

  // Test case: Invalid Token
  it('createTask (POST) - sould return 401 for invalid token', async () => {
    const response = await request(app.getHttpServer() as App)
      .post('/task/createTask')
      .set('Authorization', 'invalid-token')
      .send({ name: 'test' })
      .expect(401);

    expect((response.body as { message: string }).message).toEqual(
      'Invalid token',
    );
  });
});
