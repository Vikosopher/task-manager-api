import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  private readonly index = 'tasks';

  constructor(private readonly esService: ElasticsearchService) {}

  async createIndexWithMapping() {
    const exists = await this.esService.indices.exists({ index: this.index });

    if (!exists) {
      await this.esService.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              description: { type: 'text' },
              userId: { type: 'keyword' },
              completed: { type: 'boolean' },
              createdAt: { type: 'date' },
            },
          },
        } as Record<string, any>,
      });
      console.log('Index created with mapping.');
    } else {
      // ✅ Apply mapping to existing index (PATCH-style)
      await this.esService.indices.putMapping({
        index: this.index,
        body: {
          properties: {
            createdAt: { type: 'date' }, // fix sort issue
          },
        } as Record<string, any>,
      });
      console.log('Mapping updated on existing index.');
    }
  }

  async indexTask(task: any) {
    return this.esService.index({
      index: this.index,
      id: task._id.toString(),
      document: {
        title: task.title,
        description: task.description,
        userId: task.userId.toString(),
        completed: task.completed,
        createdAt: task.createdAt,
      },
    });
  }

  async search(userId: string, query: string, page = 1, limit = 10) {
    const from = (page - 1) * limit;

    const { hits } = await this.esService.search({
      index: this.index,
      from,
      size: limit,
      sort: ['createdAt:desc'],
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['title', 'description'],
              },
            },
            {
              match: { userId: userId.toString().trim() },
            },
          ],
        },
      },
    });

    return hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source ?? {}),
    }));
  }
}
