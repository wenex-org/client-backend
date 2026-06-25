import { ProxyModule } from './proxy';
import { McpModule } from './mcp';

export const MODULES = [ProxyModule, McpModule] as const;
