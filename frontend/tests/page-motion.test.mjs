import test from 'node:test';
import assert from 'node:assert/strict';
import { diagonalWaveFrames } from '../src/shared/pageMotion.js';

test('La ola nace en el botón y mantiene la misma geometría interpolable', () => {
  for (const [width, height] of [
    [375, 812],
    [1366, 900],
    [1920, 1080],
  ]) {
    const origin = { x: 46, y: 40 };
    const frames = diagonalWaveFrames(width, height, origin);
    assert.equal(frames.length, 17);
    assert.equal(frames[0].offset, 0);
    assert.equal(frames.at(-1).offset, 1);
    for (const frame of frames) {
      assert.ok(frame.clipPath.startsWith('polygon('));
      assert.equal(frame.clipPath.split(', ').length, 51);
      assert.equal(/NaN|Infinity/.test(frame.clipPath), false);
    }
    assert.ok(
      frames[0].clipPath
        .split(', ')
        .every((point) => point.includes('46.00px 40.00px')),
    );
    assert.notEqual(frames[8].clipPath, frames[0].clipPath);
    assert.notEqual(frames[8].clipPath, frames.at(-1).clipPath);
  }
});
