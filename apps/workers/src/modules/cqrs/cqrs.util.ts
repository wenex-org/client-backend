export const getOperation = (op: 'c' | 'u' | 'd' | 'r') => {
  if (op === 'c') return 'create';
  else if (op === 'u') return 'update';
  else if (op === 'd') return 'delete';
  else if (op === 'r') return 'read';
  throw new Error('unknown operation');
};
