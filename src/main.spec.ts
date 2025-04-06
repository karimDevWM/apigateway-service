import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('App bootstrap', () => {
  it('should create the app without errors', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    expect(app).toBeDefined();
    await app.close();
  });
});
