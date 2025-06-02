import { fixIn, ObjectId } from '@app/common/core/utils/mongo';
import { COLLECTION, Database } from '@wenex/sdk/common/core';
import { CqrsPayload } from '@app/common/core/interfaces';
import { logger } from '@wenex/sdk/common/core/utils';
import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class CqrsService {
  private readonly log = logger(CqrsService.name);

  constructor(@InjectConnection() private readonly conn: Connection) {}

  async cqrs({ id, source, after }: CqrsPayload) {
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
  }
}
