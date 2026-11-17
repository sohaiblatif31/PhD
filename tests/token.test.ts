import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedKey, safeEqual, signToken, verifyToken } from '../lib/server/token.ts';

const S = 'x'.repeat(40);

test('signed tokens verify, expire and reject tampering', () => {
  const now = 1_800_000_000_000;
  const t = signToken(60, S, now);
  assert.equal(verifyToken(t, S, now), true);
  assert.equal(verifyToken(t, S, now + 61_000), false);
  assert.equal(verifyToken(t, 'y'.repeat(40), now), false);
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ exp: 9_999_999_999 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`, S, now), false);
  assert.equal(verifyToken(`${body}.`, S, now), false);
  assert.equal(verifyToken(undefined, S, now), false);
});

test('safeEqual and feedKey', () => {
  assert.equal(safeEqual('hunter2', 'hunter2'), true);
  assert.equal(safeEqual('hunter2', 'hunter'), false);
  assert.equal(feedKey(S), feedKey(S));
  assert.notEqual(feedKey(S), feedKey('z'.repeat(40)));
});
