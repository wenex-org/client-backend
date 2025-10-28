import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { logger, toJSON, toString } from '@wenex/sdk/common/core/utils';
import { fixIn, ObjectId } from '@app/common/core/utils/mongo';
import { COLLECTION, Database } from '@wenex/sdk/common/core';
import { NATS_GATEWAY } from '@app/common/core/constants';
import { CqrsPayload } from '@app/common/core/interfaces';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Connection } from 'mongoose';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CqrsService {
  private readonly log = logger(CqrsService.name);

  constructor(
    @InjectConnection() private readonly conn: Connection,
    @Inject(NATS_GATEWAY) private readonly client: ClientProxy,
  ) {}

  async cqrs({ id, op, source, after, ...rest }: CqrsPayload): Promise<void> {
    const { db, collection } = source;
    const query = { _id: ObjectId(id) };
    const coll = COLLECTION(collection, db.split('-').pop() as Database).replace('/', '.');
    if (after) {
      await this.conn.collection(coll).replaceOne(query, fixIn(after), { upsert: true });
      this.log.extend(this.cqrs.name)(`Replaced %s document into the %s collection`, id, coll);
    } else {
      await this.conn.collection(coll).deleteOne(query);
      this.log.extend(this.cqrs.name)(`Removed %s document from the %s collection`, id, coll);
    }

    // Notify subscribers about the CQRS operation
    await this.notify(coll, { id, op, source, after, ...rest });
  }

  protected async notify(topic: string, { id, op, source, after, ...rest }: CqrsPayload) {
    try {
      await lastValueFrom(this.client.send(topic, { id, op, source, after, ...rest }));
    } catch (err) {
      this.log.extend(this.notify.name)('exception occurred with error %o', toJSON(err.message ?? err));
      if (!err.message?.startsWith('Empty response. There are no subscribers listening to that message')) {
        throw new HttpException(toString(err.message ?? err), HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
