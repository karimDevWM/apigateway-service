import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { TaskController } from './task.controller';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('TaskController', () => {
  let taskController: TaskController;
  let natsClientMock: { send: jest.Mock };

  beforeEach(async () => {
    // Mock the NATS client
    natsClientMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsClientMock }],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
  });

  describe('createUser', () => {
    it('should send data first to the auth microservice for authorization and then send data to the task microservice for creating the task', async () => {
      type resultCreateTask = { success: boolean; taskId: number };
      const req: Partial<Request> = {
        headers: {
          authorization: 'valid-token',
        },
        get: jest.fn(),
      };

      const createTaskDto = { name: 'Test' };

      natsClientMock.send
        .mockReturnValueOnce(of({ userId: 1 }))
        .mockReturnValueOnce(of({ success: true, taskId: 123 }));

      const result: resultCreateTask = await taskController.createTask(
        req as unknown as Request,
        createTaskDto,
      );

      // ✅ Ensure NATS microservice was called correctly
      expect(natsClientMock.send).toHaveBeenCalledTimes(2);
      expect(natsClientMock.send).toHaveBeenCalledWith(
        { cmd: 'validateToken' },
        { token: 'valid-token' },
      );
      expect(natsClientMock.send).toHaveBeenCalledWith(
        { cmd: 'createTask' },
        { name: 'Test', userId: 1 },
      );

      expect(result).toEqual({ success: true, taskId: 123 });
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const req: Partial<Request> = {
        headers: {},
        get: jest.fn().mockReturnValue(undefined),
      } as Partial<Request>; // ✅ Fixed empty headers
      const createTaskDto = { name: 'Test' };

      await expect(
        taskController.createTask(req as Request, createTaskDto),
      ).rejects.toThrow(new UnauthorizedException('No token provided'));
    });

    it('should throw UnauthorizedException if token validation fails', async () => {
      const req: Partial<Request> = {
        headers: { authorization: 'invalid-token' },
        get: jest.fn().mockReturnValue(undefined),
      }; // ✅ Fixed header typo
      const createTaskDto = { name: 'Test' };

      // ✅ Simulating token validation failure
      natsClientMock.send.mockReturnValueOnce(
        throwError(() => new Error('Invalid token')),
      );

      await expect(
        taskController.createTask(req as Request, createTaskDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
