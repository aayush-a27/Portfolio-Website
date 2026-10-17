/*
 * Development-only QA switches, read from the dev server URL:
 *   ?motion   preview full motion even when the OS requests reduced motion
 *   ?nowebgl  exercise the non-WebGL fallbacks (hero poster, CSS image reveals)
 * `import.meta.env.DEV` is false in production builds, so these always
 * return false there and the checks are dropped.
 */
const params =
  import.meta.env.DEV && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

export const devFlag = (name) => Boolean(params?.has(name));
