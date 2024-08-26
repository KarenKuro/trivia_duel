import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as redis from 'redis';

import { IRedisConfig } from '@common/models';

@Injectable()
export class RedisService {
  private readonly client: redis.RedisClientType;

  private readonly _logger = new Logger(RedisService.name);

  constructor(private readonly _configService: ConfigService) {
    const { url } = this._configService.get<IRedisConfig>('REDIS_CONFIG');
    this.client = redis.createClient({
      url,
    });

    this.client.connect();

    this.client.on('error', (err) => {
      this._logger.error(`Redis error: ${err}`);
      throw err; // throw an exception if there's an error
    });

    this.client.on('connect', async () => {
      await this.waitForConnection();
      this._logger.log('Redis client connected');
    });

    this.client.on('end', () => {
      this._logger.log('Redis client disconnected');
    });
  }

  /**
   * This method aimed to make sure that Redis is up and running before the app initialization.
   * @returns {void}
   */
  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * This method aimed to get cached data from redis via key.
   * @param {string} key - identifier
   * @returns {T}
   */
  async get<T>(key: string): Promise<T> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  /**
   * This method aimed to cache data into redis.
   * @param {string} key - identifier
   * @param {T} value
   * @returns {void}
   */
  async set<T>(key: string, value: T): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  /**
   * This method aimed to delete the cached data from redis.
   * @param {string} key - identifier
   * @returns {void}
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * This method aimed to get cached data from redis via key. (hGet) A hash in Redis is a collection of key-value pairs, where each key is a field and each value is the corresponding value for that field.
   * @param {string} key - identifier
   * @returns {T}
   */
  async hGet<T>(key: string, field: string): Promise<T> {
    const result = await this.client.hGet(key, field);
    return result ? (JSON.parse(result) as T) : null;
  }

  /**
   * This method aimed to get cached data from redis via key. (hGetAll) A hash in Redis is a collection of key-value pairs, where each key is a field and each value is the corresponding value for that field.
   * @param {string} key - identifier
   * @returns {[x: string]: string}
   */
  async hGetAll(key: string): Promise<{
    [x: string]: string;
  }> {
    const result = await this.client.hGetAll(key);
    return result;
  }

  /**
   * This method aimed to cache data into redis. (hSet) A hash in Redis is a collection of key-value pairs, where each key is a field and each value is the corresponding value for that field.
   * @param {string} key - identifier
   * @param {string} field
   * @param {T} value
   * @returns {void}
   */
  async hSet<T>(key: string, field: string, value: T): Promise<void> {
    await this.client.hSet(key, field, JSON.stringify(value));
  }

  /**
   * This method aimed to delete the cached data from redis. (hDel) A hash in Redis is a collection of key-value pairs, where each key is a field and each value is the corresponding value for that field.
   * @param {string} key - identifier
   * @param {string[]} fields
   * @returns {number}
   */
  async hDelete(key: string, ...fields: string[]): Promise<number> {
    const result = await this.client.hDel(key, fields);
    return result;
  }
}
