import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  parseStored,
  formatBookmark,
  generateSlug,
  uniqueSlug,
  serialize,
} from './bookmarks.ts';

test('URL with and without https:// normalises to the same value', () => {
  const a = normalizeUrl('www.example.com');
  assert.equal(a, 'https://www.example.com');
  assert.equal(normalizeUrl('https://www.example.com'), a);
  assert.equal(normalizeUrl('  https://www.example.com/  '), a);
});

test('invalid or unsafe URLs are rejected', () => {
  for (const bad of ['', '   ', 'javascript:alert(1)', 'ftp://x.com', 'not a url', null, 42]) {
    assert.equal(normalizeUrl(bad), null, String(bad));
  }
});

test('parseStored recovers from empty, corrupted, legacy and non-array values', () => {
  for (const raw of [null, undefined, '', '{not json', '{"url":"a"}', '"str"', '42', 'null', '["https://a.com"]', '[null,1,{}]']) {
    assert.deepEqual(parseStored(raw), [], String(raw));
  }
});

test('parseStored keeps valid entries and drops malformed ones', () => {
  const raw = JSON.stringify([
    { url: 'example.com', slug: 'mona-abcd' },
    { url: 'https://b.com', slug: 'bad' },
    { url: 5, slug: 'mona-1234' },
    { url: 'https://c.com', slug: 'mona-abcd' },
    { url: 'https://d.com', slug: 'mona-zz99', extra: 1 },
  ]);
  assert.deepEqual(parseStored(raw), [
    { url: 'https://example.com', slug: 'mona-abcd' },
    { url: 'https://d.com', slug: 'mona-zz99' },
  ]);
});

test('serialize round-trips through parseStored', () => {
  const list = [{ url: 'https://a.com', slug: 'mona-1a2B' }];
  assert.deepEqual(parseStored(serialize(list)), list);
});

test('bookmark formats as "<url> :: <slug>"', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});

test('slugs are mona- + base62 and unique', () => {
  assert.match(generateSlug(), /^mona-[0-9a-zA-Z]{4}$/);
  const fixed = () => 0;
  const first = generateSlug(fixed);
  const next = uniqueSlug([{ url: 'https://a.com', slug: first }], fixed);
  assert.notEqual(next, first);
  assert.match(next, /^mona-[0-9a-zA-Z]+$/);
});
