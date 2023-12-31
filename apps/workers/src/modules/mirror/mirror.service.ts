import { date, fixIn, logger } from '@app/common/utils';
import { MirrorPayload } from '@app/common/interfaces';
import { ObjectId } from '@wenex/sdk/common';
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class MirrorService {
  private readonly log = logger(MirrorService.name);

  constructor(private readonly connection: Connection) {}

  async mirror(payload: MirrorPayload) {
    const { source, data, id } = payload;
    this.connection.db
      .collection(source.collection)
      .replaceOne({ _id: ObjectId(id) }, fixIn(data), { upsert: true });

    this.log
      .get(this.mirror.name)
      .notice(date(`Inserted %s document into the %s collection`), id, source.collection);
  }
}
