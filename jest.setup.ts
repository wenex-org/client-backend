/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

import ms from 'ms';

process.env.MONGO_PREFIX = 'try';
process.env.REDIS_PREFIX = 'try';

jest.setTimeout(ms('24h'));
