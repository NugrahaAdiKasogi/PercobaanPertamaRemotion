import { staticFile } from 'remotion';

export const getMediaSrc = (path: string): string => {
  const url = staticFile(path);
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace('://localhost', '://127.0.0.1');
    if (url.startsWith('http')) {
      return url.replace('://localhost', '://127.0.0.1');
    }
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};