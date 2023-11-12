export type Check = 'disk' | 'memory' | 'mongo' | 'redis' | 'kafka' | 'grpc';

export type HealthCheckOptions = (
  | {
      [key in Check]?:
        | {
            key?: string;
            options?: any;
            service?: string; // grpc
          }
        | undefined
        | null;
    }
  | Check
)[];
