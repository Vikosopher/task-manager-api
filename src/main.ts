import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SearchService } from 'search/search.service'; // ✅ Import the service

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const searchService = app.get(SearchService); // ✅ Get the SearchService
  await searchService.createIndexWithMapping(); // ✅ Ensure index + mapping exist

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
