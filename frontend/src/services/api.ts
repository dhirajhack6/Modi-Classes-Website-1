/// <reference types="vite/client" />

/**
 * Modi Classes API Service Configuration & Helpers
 *
 * Default Backend URL: https://modi-classes-website-1.onrender.com
 * Overridable via VITE_BACKEND_URL or VITE_API_URL environment variable.
 */

// Normalized backend base URL without trailing slash
const metaEnv = (import.meta as any).env || {};
export const BACKEND_URL: string = (
  metaEnv.VITE_BACKEND_URL ||
  metaEnv.VITE_API_URL ||
  'https://modi-classes-website-1.onrender.com'
).replace(/\/+$/, '');

/**
 * Returns the resolved URL for an API endpoint.
 *
 * Examples:
 * - getApiUrl('/api/books') => 'https://modi-classes-website-1.onrender.com/api/books'
 * - getApiUrl('https://example.com/data') => 'https://example.com/data'
 */
export function getApiUrl(endpoint: string): string {
  if (!endpoint) return BACKEND_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BACKEND_URL}${cleanPath}`;
}

/**
 * Convenience fetch wrapper that ensures the API base URL is prepended.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string') {
    return fetch(getApiUrl(input), init);
  }
  return fetch(input, init);
}
