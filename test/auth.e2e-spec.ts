import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { App } from 'supertest/types';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // mocking the nats client
  const mockNatsClient: Partial<ClientProxy> = {
    send: jest.fn().mockImplementation(() => of({ message: 'mocked' })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('NATS_SERVICE')
      .useValue(mockNatsClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  describe('/auth/signup (POST) - invalid inputs', () => {
    it('should return 400 if username is missing', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Secure1234',
        })
        .expect(400);
    });

    it('should return 400 if email is invalid', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signup')
        .send({
          username: 'john',
          email: 'not-an-email',
          password: 'Secure1234',
        })
        .expect(400);
    });

    it('should return 400 if password is too short', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signup')
        .send({
          username: 'john',
          email: 'john@example.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('/auth/signin (POST) - invalid inputs', () => {
    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signin')
        .send({
          password: 'Secure1234',
        })
        .expect(400);
    });

    it('should return 400 if email is invalid', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'Secure1234',
        })
        .expect(400);
    });

    it('should return 400 if password is missing', async () => {
      await request(app.getHttpServer() as App)
        .post('/auth/signin')
        .send({
          email: 'john@example.com',
        })
        .expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
