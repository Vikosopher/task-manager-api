import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from 'config/configuration';

// ✅ Feature Modules
import { AuthModule } from 'auth/auth.module';
import { UsersModule } from 'users/users.module';
import { TasksModule } from 'tasks/tasks.module';
import { SearchModule } from 'search/search.module';

@Module({
  imports: [
    // ✅ Global Config Setup
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // ✅ MongoDB Setup
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
      }),
    }),

    // ✅ Feature Modules
    AuthModule,
    UsersModule,
    TasksModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
