import test from 'node:test';
import assert from 'node:assert/strict';
import { netlifyRedirects } from '../scripts/build-netlify.mjs';

test('Netlify forwards API and shared pages before the React fallback', () => {
  const rules = netlifyRedirects('https://backend.example/').trim().split('\n');
  assert.deepEqual(rules, [
    '/api/* https://backend.example/api/:splat 200!',
    '/producto/* https://backend.example/producto/:splat 200!',
    '/idea/* https://backend.example/idea/:splat 200!',
    '/* /index.html 200',
  ]);
});

test('Netlify rejects missing, insecure, or malformed backend origins', () => {
  for (const value of [undefined, '', 'not-a-url', 'http://backend.example',
    'https://user:password@backend.example', 'https://backend.example/api',
    'https://backend.example/?key=secret', 'https://backend.example/#fragment']) {
    assert.throws(() => netlifyRedirects(value), /NETLIFY_BACKEND_ORIGIN/);
  }
});

test('Netlify rejects proxy loops for the production site and preview URLs', () => {
  const sites = ['https://bazarnazareth.netlify.app', 'https://preview--bazarnazareth.netlify.app'];
  for (const site of sites) {
    assert.throws(() => netlifyRedirects(site, sites), /proxy loop/);
  }
  assert.doesNotThrow(() => netlifyRedirects('https://backend.example', [...sites, undefined]));
});
