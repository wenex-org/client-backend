import { Application } from '../interfaces';

export const APP: Application = {
  GATEWAY: {
    PACKAGE: { NAME: 'gateway', SYMBOL: Symbol('AUTH') },
    SERVICES: {
      GRANTS: { NAME: 'GrantsService' },
      AUTHORIZATION: { NAME: 'AuthorizationService' },
      AUTHENTICATION: { NAME: 'AuthenticationService' },
    },
    API_PORT: +(process.env.AUTH_API_PORT || 6000),
  },
  SERVICE: {
    PACKAGE: { NAME: 'special', SYMBOL: Symbol('SPECIAL') },
    SERVICES: {
      STATS: { NAME: 'StatsService' },
    },
    CLIENT: { ID: 'special-client' },
    CONSUMER: { GROUP_ID: 'special-group' },
    API_PORT: +(process.env.SPECIAL_API_PORT || 6001),
  },
};
