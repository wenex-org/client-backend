import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext } from '@nestjs/common';

export function getRequest<T = any>(context: ExecutionContext): T {
  const type = context.getType<GqlContextType>();

  switch (type) {
    case 'graphql': {
      return GqlExecutionContext.create(context).getContext().req;
    }
    case 'http': {
      return context.switchToHttp().getRequest();
    }
    default:
      throw new Error('Unknown context type');
  }
}
