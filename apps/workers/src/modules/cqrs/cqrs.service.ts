import { fixIn, ObjectId } from '@app/common/core/utils/mongo';
import { CqrsPayload } from '@app/common/core/interfaces';
import { logger } from '@wenex/sdk/common/core/utils';
import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class CqrsService {
  private readonly log = logger(CqrsService.name);

  constructor(@InjectConnection() private readonly conn: Connection) {}

  async cqrs(payload: CqrsPayload) {
    const { source, after, id } = payload;
    if (after) {
      await this.conn.collection(source.collection).replaceOne({ _id: ObjectId(id) }, fixIn(after), { upsert: true });
      this.log.extend(this.cqrs.name)(`Replaced %s document into the %s collection`, id, source.collection);
    } else {
      await this.conn.collection(source.collection).deleteOne({ _id: ObjectId(id) });
      this.log.extend(this.cqrs.name)(`Removed %s document from the %s collection`, id, source.collection);
    }
  }
}
