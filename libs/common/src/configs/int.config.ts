export function INT_CONFIG() {
  return {
    LANG: process.env.EXCEPTION_LANG || 'en',
    TZ: process.env.DEFAULT_TIMEZONE || 'Asia/Tehran',
  };
}
