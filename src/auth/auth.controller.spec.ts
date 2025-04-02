import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dtos/createUser.dto';
import { lastValueFrom, of } from 'rxjs';
// import { SignInUserDto } from './dtos/signInUser.dto';
import { validate } from 'class-validator';
import { SignInUserDto } from './dtos/signInUser.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let natsClientMock: { send: jest.Mock };

  beforeEach(async () => {
    // Mock the NATS client
    natsClientMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsClientMock }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('createUser', () => {
    it('should send signup data to the auth microservice', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Test12345!',
        username: 'testuser',
      };

      const errors = await validate(dto);

      // Ensure there are no validation errors since data is valid
      expect(errors.length).toBe(0);

      natsClientMock.send.mockReturnValue(of({ success: true, userId: 1 }));

      const result = lastValueFrom(authController.createUser(dto));

      expect(natsClientMock.send).toHaveBeenCalledWith(
        { cmd: 'createUser' },
        dto,
      );
      await expect(result).resolves.toEqual({ success: true, userId: 1 });
    });
  });

  describe('login', () => {
    it('should send login data to the auth microservice', async () => {
      const dto: SignInUserDto = {
        email: 'test@example.com',
        password: 'Test12345!',
      };

      const errors = await validate(dto);

      // Ensure there are no validation errors since data is valid
      expect(errors.length).toBe(0);

      natsClientMock.send.mockReturnValue(
        of({ success: true, token: 'jwt-token' }),
      );

      const result = lastValueFrom(authController.login(dto));

      expect(natsClientMock.send).toHaveBeenCalledWith(
        { cmd: 'loginUser' },
        dto,
      );
      await expect(result).resolves.toEqual({
        success: true,
        token: 'jwt-token',
      });
    });
  });
});
