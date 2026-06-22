import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Global route prefix.
   * All routes are served under /api/...
   * excludeRoutes keeps the root health-check at GET / (no /api prefix)
   * so load-balancer probes keep working.
   */
  app.setGlobalPrefix('api', { exclude: ['/'] });

  /**
   * URI-based versioning.
   * Version is encoded directly in the path:  /api/v{n}/module/route
   * Alternatives (not chosen):
   *   VersioningType.HEADER  → "X-API-Version: 1"
   *   VersioningType.MEDIA_TYPE → Accept: application/json;v=1
   *   VersioningType.CUSTOM  → arbitrary resolver function
   * URI versioning is chosen because it is the most explicit,
   * cache-friendly, and easiest to consume for third-party API clients.
   */
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('LedgerMind API')
    .setDescription('API documentation for LedgerMind backend')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

void bootstrap();
