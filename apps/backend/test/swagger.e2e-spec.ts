import { DocumentBuilder } from '@nestjs/swagger';

describe('Swagger Configuration', () => {
  it('should create Swagger config with correct settings', () => {
    const config = new DocumentBuilder()
      .setTitle('OrderEase API')
      .setDescription('RBAC-enabled OrderEase Backend')
      .setVersion('1.0')
      .build();

    expect(config).toBeDefined();
    expect(config.info).toBeDefined();
    expect(config.info.title).toBe('OrderEase API');
    expect(config.info.description).toBe('RBAC-enabled OrderEase Backend');
    expect(config.info.version).toBe('1.0');
  });
});
