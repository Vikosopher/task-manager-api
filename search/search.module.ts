// src/search/search.module.ts

import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('elasticsearchHost'),
        headers: {
          accept: 'application/vnd.elasticsearch+json;compatible-with=8',
          'content-type':
            'application/vnd.elasticsearch+json;compatible-with=8',
        },
      }),
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
