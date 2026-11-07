import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function netlifyRedirects(backendOrigin, siteOrigins = []) {
  let backend;
  try {
    backend = new URL(backendOrigin);
  } catch {
    throw new Error('Set NETLIFY_BACKEND_ORIGIN to the HTTPS origin of your deployed ASP.NET backend.');
  }
  if (backend.protocol !== 'https:' || backend.username || backend.password ||
      backend.pathname !== '/' || backend.search || backend.hash) {
    throw new Error('NETLIFY_BACKEND_ORIGIN must be an HTTPS origin without credentials, a path, a query, or a fragment.');
  }
  if (siteOrigins.filter(Boolean).some(value => new URL(value).origin === backend.origin)) {
    throw new Error('NETLIFY_BACKEND_ORIGIN must point to the ASP.NET host, not this Netlify site (that would create a proxy loop).');
  }
  return [
    `/api/* ${backend.origin}/api/:splat 200!`,
    `/producto/* ${backend.origin}/producto/:splat 200!`,
    `/idea/* ${backend.origin}/idea/:splat 200!`,
    '/* /index.html 200',
    '',
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    // Validate before building. Never publish an SPA fallback for API requests.
    const redirects = netlifyRedirects(process.env.NETLIFY_BACKEND_ORIGIN,
      [process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL]);
    const { build } = await import('vite');
    await build({ root: fileURLToPath(new URL('../', import.meta.url)) });
    await writeFile(new URL('../dist/_redirects', import.meta.url), redirects);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
