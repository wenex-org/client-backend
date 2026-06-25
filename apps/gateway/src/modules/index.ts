import { McpModule } from './mcp';
import { ProxyModule } from './proxy';

export const MODULES = [McpModule, ProxyModule] as const;
