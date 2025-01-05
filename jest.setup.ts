/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import ms from 'ms';

process.env.MONGO_PREFIX = 'tst';
process.env.REDIS_PREFIX = 'tst';

jest.setTimeout(ms('24h'));
